package net.ryanh.lynks;

import android.app.DownloadManager;
import android.content.ActivityNotFoundException;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.net.Uri;
import android.os.Build;
import android.os.Environment;
import android.text.TextUtils;
import android.webkit.URLUtil;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.widget.Toast;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.Arrays;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Resources, thumbnails and pasted images reach the page as relative {@code /api/...} urls
 * in img, video and iframe tags, which can carry neither the server's origin nor the bearer
 * token. So the WebView's own GETs for them are sent on to the server from here, with the
 * token, as if the app were served from it. Axios calls the server directly instead, since
 * an intercepted request has no body.
 */
final class ApiProxy {

    /** Written by lib/server.ts through the Preferences plugin, whose default group this is. */
    private static final String PREFERENCES = "CapacitorStorage";
    private static final String SERVER_KEY = "lynks.serverUrl";
    private static final String TOKEN_KEY = "lynks.sessionToken";

    private static final String API_PATH = "/api/";

    // Lowercase, since the WebView does not promise a case. Conditional headers are left out, because a 304 cannot
    // be handed back to it.
    private static final Set<String> FORWARDED_HEADERS = new HashSet<>(Arrays.asList("accept", "accept-language", "range", "user-agent"));

    // describe the connection to the server, not the one the WebView thinks it has
    private static final Set<String> HOP_BY_HOP_HEADERS = new HashSet<>(Arrays.asList("connection", "keep-alive", "transfer-encoding"));

    private static final Pattern FILE_NAME = Pattern.compile("filename=\"?([^\";]+)\"?");

    private final Context context;
    private final Uri local;
    private final SharedPreferences preferences;

    ApiProxy(Context context, Uri local) {
        this.context = context;
        this.local = local;
        this.preferences = context.getSharedPreferences(PREFERENCES, Context.MODE_PRIVATE);
    }

    /** Null for anything that is not the app asking for the API, which the local server answers as before. */
    WebResourceResponse intercept(WebResourceRequest request) {
        if (!"GET".equals(request.getMethod())) return null;
        Uri remote = remote(request.getUrl());
        if (remote == null) return null;

        try {
            HttpURLConnection connection = open(remote);
            for (Map.Entry<String, String> header : request.getRequestHeaders().entrySet()) {
                if (FORWARDED_HEADERS.contains(header.getKey().toLowerCase(Locale.ROOT))) {
                    connection.setRequestProperty(header.getKey(), header.getValue());
                }
            }
            return respond(connection);
        } catch (IOException e) {
            return failure();
        }
    }

    /** WebView hands every download to the app, which here means the resource download buttons. */
    void download(String url, String userAgent, String contentDisposition, String mimeType, long contentLength) {
        Uri remote = remote(Uri.parse(url));
        if (remote == null) {
            try {
                context.startActivity(new Intent(Intent.ACTION_VIEW, Uri.parse(url)).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK));
            } catch (ActivityNotFoundException ignored) {
            }
            return;
        }

        // URLUtil only reads an attachment disposition, and the server's is inline; without either the url ends in the id
        String name = fileName(contentDisposition);
        if (name == null) name = URLUtil.guessFileName(url, null, mimeType);

        DownloadManager.Request request = new DownloadManager.Request(remote)
                .setTitle(name)
                .setMimeType(mimeType)
                .setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED);
        String token = preferences.getString(TOKEN_KEY, null);
        if (token != null) request.addRequestHeader("Authorization", "Bearer " + token);
        // Before Android 10 a public directory needs a storage permission the app does not ask for.
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            request.setDestinationInExternalPublicDir(Environment.DIRECTORY_DOWNLOADS, name);
        }
        DownloadManager manager = (DownloadManager) context.getSystemService(Context.DOWNLOAD_SERVICE);
        manager.enqueue(request);
        Toast.makeText(context, context.getString(R.string.downloading, name), Toast.LENGTH_SHORT).show();
    }

    private static String fileName(String contentDisposition) {
        if (contentDisposition == null) return null;
        Matcher matcher = FILE_NAME.matcher(contentDisposition);
        if (!matcher.find()) return null;
        // a name is all it may set, never a directory
        String name = matcher.group(1).replaceAll("[/\\\\]", "_").trim();
        return name.isEmpty() || name.startsWith(".") ? null : name;
    }

    /** The same path and query on the chosen server, or null when the url is not the app's API or no server is set. */
    private Uri remote(Uri url) {
        if (!local.getScheme().equals(url.getScheme()) || !local.getAuthority().equals(url.getAuthority())) return null;
        String path = url.getEncodedPath();
        if (path == null || !path.startsWith(API_PATH)) return null;
        String root = preferences.getString(SERVER_KEY, null);
        if (root == null || root.isEmpty()) return null;

        String query = url.getEncodedQuery();
        return Uri.parse(root + path + (query != null ? "?" + query : ""));
    }

    private HttpURLConnection open(Uri remote) throws IOException {
        HttpURLConnection connection = (HttpURLConnection) new URL(remote.toString()).openConnection();
        connection.setConnectTimeout(15_000);
        connection.setReadTimeout(60_000);
        String token = preferences.getString(TOKEN_KEY, null);
        if (token != null) connection.setRequestProperty("Authorization", "Bearer " + token);
        return connection;
    }

    private static WebResourceResponse respond(HttpURLConnection connection) throws IOException {
        int status = connection.getResponseCode();
        // only a redirect HttpURLConnection would not follow, such as https to http
        if (status >= 300 && status < 400) return failure();

        InputStream body = status >= 400 ? connection.getErrorStream() : connection.getInputStream();
        if (body == null) body = new ByteArrayInputStream(new byte[0]);

        Map<String, String> headers = new HashMap<>();
        for (Map.Entry<String, List<String>> header : connection.getHeaderFields().entrySet()) {
            String name = header.getKey();
            if (name != null && !HOP_BY_HOP_HEADERS.contains(name.toLowerCase(Locale.ROOT))) {
                headers.put(name, TextUtils.join(", ", header.getValue()));
            }
        }

        String mimeType = "application/octet-stream";
        String charset = null;
        String contentType = connection.getContentType();
        if (contentType != null) {
            String[] parts = contentType.split(";");
            mimeType = parts[0].trim();
            for (int i = 1; i < parts.length; i++) {
                String part = parts[i].trim();
                if (part.toLowerCase(Locale.ROOT).startsWith("charset=")) charset = part.substring("charset=".length());
            }
        }

        String reason = connection.getResponseMessage();
        // WebResourceResponse refuses an empty reason, and HTTP/2 has none
        if (reason == null || reason.isEmpty()) reason = status >= 400 ? "Error" : "OK";
        return new WebResourceResponse(mimeType, charset, status, reason, headers, body);
    }

    private static WebResourceResponse failure() {
        return new WebResourceResponse("text/plain", "utf-8", 502, "Bad Gateway", new HashMap<>(),
                new ByteArrayInputStream(new byte[0]));
    }
}
