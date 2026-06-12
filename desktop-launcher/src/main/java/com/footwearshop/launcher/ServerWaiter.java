package com.footwearshop.launcher;

import java.io.IOException;
import java.net.HttpURLConnection;
import java.net.URI;
import java.net.URL;

public final class ServerWaiter {

    private static final String APP_URL = "http://127.0.0.1:8080/";
    private static final int TIMEOUT_MS = 1500;
    private static final int MAX_ATTEMPTS = 60;

    private ServerWaiter() {
    }

    public static String appUrl() {
        return APP_URL;
    }

    public static boolean isPortInUse() {
        try {
            HttpURLConnection connection = openConnection();
            int code = connection.getResponseCode();
            connection.disconnect();
            return code > 0;
        } catch (IOException ex) {
            return false;
        }
    }

    public static void waitUntilReady() throws InterruptedException, IOException {
        for (int attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
            try {
                HttpURLConnection connection = openConnection();
                int code = connection.getResponseCode();
                connection.disconnect();
                if (code >= 200 && code < 500) {
                    return;
                }
            } catch (IOException ignored) {
                // Server still starting
            }
            Thread.sleep(1000L);
        }
        throw new IOException("Server did not start within " + MAX_ATTEMPTS + " seconds.");
    }

    private static HttpURLConnection openConnection() throws IOException {
        URL url = URI.create(APP_URL).toURL();
        HttpURLConnection connection = (HttpURLConnection) url.openConnection();
        connection.setRequestMethod("GET");
        connection.setConnectTimeout(TIMEOUT_MS);
        connection.setReadTimeout(TIMEOUT_MS);
        connection.connect();
        return connection;
    }
}
