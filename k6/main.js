export const options = {
    thresholds: {
        // Assert that 99% of requests finish within 1000ms.
        "http_req_duration{books: \"list-books\"}": ["p(99) < 1000"],
        "http_req_duration{books: \"new-books\"}": ["p(99) < 1000"],
        "http_req_duration{books: \"authors\"}": ["p(99) < 1000"],
        "http_req_duration{books: \"author-rating\"}": ["p(99) < 1000"]
    },
    scenarios: {
        list_books: {
            executor: 'per-vu-iterations',
            exec: 'list_books',
            vus: 100,
            iterations: 500,
            maxDuration: '5m',
        },
        new_books: {
            executor: 'per-vu-iterations',
            exec: 'new_books',
            vus: 100,
            iterations: 500,
            maxDuration: '5m',
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