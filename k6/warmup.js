// The base URL can be provided via an environment variable
// Default points to localhost:8080
// Example usage with Docker: -e BASE_URL=http://host.docker.internal:8080
const BASE_URL = __ENV.BASE_URL || 'http://localhost:8080';

// k6 configuration options
export const options = {
    thresholds: {
        // Assert that 99% of requests finish within 1000ms
        // These thresholds will mark the test as failed if not met
        "http_req_duration{books: \"list-books\"}": ["p(99) < 1000"],
        "http_req_duration{books: \"new-books\"}": ["p(99) < 1000"]
    },
    scenarios: {
        // Warmup scenario configuration
        // - Runs 10 virtual users (vus)
        // - Each VU executes 20 iterations
        // - Maximum duration capped at 30 seconds
        warmup: {
            "executor": "per-vu-iterations",
            "maxDuration": "30s",
            "iterations": 20,
            "vus": 10
        }
    }
};

import http from 'k6/http';
import { check } from 'k6';

// Main function executed for each VU iteration
// Simulates a user accessing both the books list and new books endpoints
export default function () {
    list_books();
    new_books();
};

// Simulates accessing the books listing endpoint
// Tags are used to categorize metrics in k6's results
export function list_books() {
    let res = http.get(`${BASE_URL}/books`, { tags: { books: "list-books" } });
    // Validate response status
    // This check will appear in k6's results but won't fail the test
    check(res, { "status was 200": (r) => r.status == 200 }, { books: "list-books" });
}

// Simulates accessing the new books endpoint
export function new_books() {
    let res = http.get(`${BASE_URL}/new-books`, { tags: { books: "new-books" } });
    // Validate response status
    check(res, { "status was 200": (r) => r.status == 200 }, { books: "new-books" });
}