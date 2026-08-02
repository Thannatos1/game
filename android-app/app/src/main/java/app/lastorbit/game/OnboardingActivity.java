package app.lastorbit.game;

import android.app.Activity;
import android.content.Intent;
import android.content.SharedPreferences;
import android.graphics.Color;
import android.os.Bundle;
import android.view.Window;
import android.widget.Button;

public class OnboardingActivity extends Activity {
    private static final String PREFS_NAME = "last_orbit_native";
    // New key makes the fixed onboarding appear once for users upgrading from 2.0.0.
    private static final String KEY_ONBOARDING_COMPLETE = "onboarding_complete_v2";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        SharedPreferences preferences = getSharedPreferences(PREFS_NAME, MODE_PRIVATE);
        if (preferences.getBoolean(KEY_ONBOARDING_COMPLETE, false)) {
            openGame();
            return;
        }

        configureSystemBars();
        setContentView(R.layout.activity_onboarding);

        Button getStartedButton = findViewById(R.id.get_started_button);
        getStartedButton.setOnClickListener(view -> {
            preferences.edit().putBoolean(KEY_ONBOARDING_COMPLETE, true).apply();
            openGame();
        });
    }

    private void configureSystemBars() {
        Window window = getWindow();
        window.setStatusBarColor(Color.parseColor("#05050F"));
        window.setNavigationBarColor(Color.parseColor("#05050F"));
        window.getDecorView().setSystemUiVisibility(0);
    }

    private void openGame() {
        Intent intent = new Intent(this, LauncherActivity.class);
        // Android Browser Helper requires LauncherActivity to enter through a NEW_TASK intent.
        // Otherwise it restarts itself and can immediately finish before Chrome opens the TWA.
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        startActivity(intent);
        finishAndRemoveTask();
    }
}
