package net.ryanh.lynks;

import android.content.Context;
import android.os.Build;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.os.VibratorManager;

import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

/**
 * Plays short clicks on the vibrator. Deliberately not View.performHapticFeedback, which
 * goes silent whenever the system's touch feedback is off, and that setting buzzes every
 * tap on the phone. Each kind uses the best the device has: composed primitives, then
 * predefined effects, then a pulse a few milliseconds long.
 */
@CapacitorPlugin(name = "Haptics")
public class HapticsPlugin extends Plugin {

    private Vibrator vibrator;

    @Override
    public void load() {
        Context context = getContext();
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            vibrator = ((VibratorManager) context.getSystemService(Context.VIBRATOR_MANAGER_SERVICE)).getDefaultVibrator();
        } else {
            vibrator = legacyVibrator(context);
        }
    }

    @SuppressWarnings("deprecation")
    private static Vibrator legacyVibrator(Context context) {
        return (Vibrator) context.getSystemService(Context.VIBRATOR_SERVICE);
    }

    @PluginMethod
    public void perform(PluginCall call) {
        if (vibrator != null && vibrator.hasVibrator()) play(call.getString("kind", "tick"));
        call.resolve();
    }

    private void play(String kind) {
        boolean doubled = kind.equals("reject");
        boolean strong = kind.equals("toggleOn") || kind.equals("confirm") || doubled;

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            int primitive = strong || kind.equals("threshold")
                    ? VibrationEffect.Composition.PRIMITIVE_CLICK
                    : VibrationEffect.Composition.PRIMITIVE_TICK;
            if (vibrator.areAllPrimitivesSupported(primitive)) {
                float scale = strong ? 0.8f : 0.5f;
                VibrationEffect.Composition composition = VibrationEffect.startComposition().addPrimitive(primitive, scale);
                if (doubled) composition.addPrimitive(primitive, scale, 80);
                vibrator.vibrate(composition.compose());
                return;
            }
        }
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            int effect = doubled ? VibrationEffect.EFFECT_DOUBLE_CLICK
                    : strong ? VibrationEffect.EFFECT_CLICK
                    : VibrationEffect.EFFECT_TICK;
            vibrator.vibrate(VibrationEffect.createPredefined(effect));
            return;
        }
        long ms = strong ? 20 : 10;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            vibrator.vibrate(doubled
                    ? VibrationEffect.createWaveform(new long[]{0, ms, 80, ms}, -1)
                    : VibrationEffect.createOneShot(ms, VibrationEffect.DEFAULT_AMPLITUDE));
        } else {
            legacyVibrate(doubled ? new long[]{0, ms, 80, ms} : new long[]{0, ms});
        }
    }

    @SuppressWarnings("deprecation")
    private void legacyVibrate(long[] pattern) {
        vibrator.vibrate(pattern, -1);
    }
}
