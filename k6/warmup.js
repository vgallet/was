export const options = {
    thresholds: {
        // Assert that 99% of requests finish within 1000ms.
        "http_req_duration{books: \"list-books\"}": ["p(99) < 1000"],
        "http_req_duration{books: \"new-books\"}": ["p(99) < 1000"]
    },
    scenarios: {
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

// Simulated user behavior
export default function () {
    list_books();
    new_books();
};


export function list_books() {
    let res = http.get("http://localhost:8080/books", { tags: { books: "list-books" } });
    // Validate response status
    check(res, { "status was 200": (r) => r.status == 200 }, { books: "list-books" });
}

export function new_books() {
    let res = http.get("http://localhost:8080/new-books", { tags: { books: "new-books" } });
    // Validate response status
    check(res, { "status was 200": (r) => r.status == 200 }, { books: "new-books" });
}