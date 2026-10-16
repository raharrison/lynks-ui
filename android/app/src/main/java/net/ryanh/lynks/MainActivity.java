package net.ryanh.lynks;

import android.net.Uri;
import android.os.Bundle;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebView;

import com.getcapacitor.BridgeActivity;
import com.getcapacitor.BridgeWebViewClient;

public class MainActivity extends BridgeActivity {

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        ApiProxy proxy = new ApiProxy(this, Uri.parse(bridge.getLocalUrl()));
        bridge.setWebViewClient(new BridgeWebViewClient(bridge) {
            @Override
            public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                WebResourceResponse response = proxy.intercept(request);
                return response != null ? response : super.shouldInterceptRequest(view, request);
            }
        });
        bridge.getWebView().setDownloadListener(proxy::download);
    }
}
