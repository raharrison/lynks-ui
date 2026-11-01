package net.ryanh.lynks;

import android.graphics.Rect;
import android.os.Build;
import android.webkit.WebView;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.util.ArrayList;
import java.util.List;

/**
 * Takes a strip of the left edge back from gesture navigation, which otherwise turns
 * every swipe from that edge into Back before the WebView sees it. Android honours at
 * most 200dp of each edge. The zone arrives in CSS pixels, which the WebView maps 1:1
 * to dp.
 */
@CapacitorPlugin(name = "EdgeSwipe")
public class EdgeSwipePlugin extends Plugin {

    @PluginMethod
    public void setZone(PluginCall call) {
        JSObject zone = call.getObject("zone");
        getActivity().runOnUiThread(() -> {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                WebView view = getBridge().getWebView();
                List<Rect> rects = new ArrayList<>();
                if (zone != null) {
                    float density = view.getResources().getDisplayMetrics().density;
                    rects.add(new Rect(
                            0,
                            Math.round(zone.getInteger("top", 0) * density),
                            Math.round(zone.getInteger("width", 0) * density),
                            Math.round(zone.getInteger("bottom", 0) * density)));
                }
                view.setSystemGestureExclusionRects(rects);
            }
            call.resolve();
        });
    }
}
