package com.kazenites.security;

import java.time.Duration;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Service;

@Service
public class LoginAttemptService {
    private static class Attempt {
        int failures = 0;
        long blockedUntil = 0L;
    }

    private final ConcurrentHashMap<String, Attempt> attempts = new ConcurrentHashMap<>();
    private final int maxFailures = 5;
    private final Duration blockDuration = Duration.ofMinutes(15);

    public boolean isBlocked(String key) {
        var now = System.currentTimeMillis();
        var a = attempts.get(key);
        return a != null && a.blockedUntil > now;
    }

    public void onSuccess(String key) {
        attempts.remove(key);
    }

    public void onFailure(String key) {
        var now = System.currentTimeMillis();
        var a = attempts.computeIfAbsent(key, k -> new Attempt());
        if (a.blockedUntil > now) {
            return; // already blocked
        }
        a.failures += 1;
        if (a.failures >= maxFailures) {
            a.blockedUntil = now + blockDuration.toMillis();
            a.failures = 0;
        }
    }
}
