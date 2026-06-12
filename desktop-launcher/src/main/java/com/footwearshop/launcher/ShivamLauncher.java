package com.footwearshop.launcher;

import javafx.application.Application;
import javafx.application.Platform;
import javafx.geometry.Pos;
import javafx.scene.Scene;
import javafx.scene.control.Alert;
import javafx.scene.control.Label;
import javafx.scene.image.Image;
import javafx.scene.layout.StackPane;
import javafx.scene.layout.VBox;
import javafx.scene.web.WebView;
import javafx.stage.Stage;
import javafx.stage.StageStyle;

import java.io.InputStream;

public class ShivamLauncher extends Application {

    private static final String APP_TITLE = "Shivam Footwear Shop";
    private final InstallPaths paths = new InstallPaths();
    private final BackendProcess backend = new BackendProcess(paths);
    private Stage splashStage;

    public static void main(String[] args) {
        launch(args);
    }

    @Override
    public void start(Stage primaryStage) {
        if (ServerWaiter.isPortInUse()) {
            // Backend still running from a previous session — open UI without starting another instance
            openMainWindow(primaryStage);
            return;
        }

        showSplash();
        Thread startupThread = new Thread(() -> {
            try {
                backend.start();
                ServerWaiter.waitUntilReady();
                Platform.runLater(() -> openMainWindow(primaryStage));
            } catch (Exception ex) {
                Platform.runLater(() -> {
                    hideSplash();
                    showError("Failed to start Shivam Footwear:\n" + ex.getMessage());
                    Platform.exit();
                });
            }
        }, "backend-startup");
        startupThread.setDaemon(true);
        startupThread.start();
    }

    @Override
    public void stop() {
        hideSplash();
        backend.stop();
    }

    private void openMainWindow(Stage stage) {
        hideSplash();

        WebView webView = new WebView();
        webView.getEngine().load(ServerWaiter.appUrl());

        Scene scene = new Scene(webView);
        stage.setTitle(APP_TITLE);
        stage.setScene(scene);
        stage.setMaximized(true);
        loadIcon(stage).ifPresent(stage.getIcons()::add);
        stage.setOnCloseRequest(event -> {
            backend.stop();
            Platform.exit();
        });
        stage.show();
    }

    private void showSplash() {
        Label title = new Label(APP_TITLE);
        title.setStyle("-fx-font-size: 22px; -fx-font-weight: bold;");
        Label subtitle = new Label("Starting application...");
        subtitle.setStyle("-fx-font-size: 14px;");

        VBox content = new VBox(12, title, subtitle);
        content.setAlignment(Pos.CENTER);

        StackPane root = new StackPane(content);
        root.setStyle("-fx-background-color: #0f172a; -fx-padding: 40;");
        title.setStyle(title.getStyle() + " -fx-text-fill: white;");
        subtitle.setStyle(subtitle.getStyle() + " -fx-text-fill: #cbd5e1;");

        splashStage = new Stage(StageStyle.UNDECORATED);
        splashStage.setTitle(APP_TITLE);
        splashStage.setScene(new Scene(root, 480, 220));
        loadIcon(splashStage).ifPresent(splashStage.getIcons()::add);
        splashStage.show();
    }

    private void hideSplash() {
        if (splashStage != null) {
            splashStage.close();
            splashStage = null;
        }
    }

    private void showError(String message) {
        Alert alert = new Alert(Alert.AlertType.ERROR);
        alert.setTitle(APP_TITLE);
        alert.setHeaderText("Startup Error");
        alert.setContentText(message);
        alert.showAndWait();
    }

    private java.util.Optional<Image> loadIcon(Stage stage) {
        try (InputStream stream = getClass().getResourceAsStream("/icon.png")) {
            if (stream != null) {
                return java.util.Optional.of(new Image(stream));
            }
        } catch (Exception ignored) {
            // Icon is optional
        }
        return java.util.Optional.empty();
    }
}
