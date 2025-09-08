import { NextResponse } from "next/server";

/**
 * API route to check the status of websites from the server.
 */
export async function POST(request: Request) {
    try {
        const urls: string[] = (await request.json()) || [];
        const results = await Promise.all(
            urls.map(async (url) => {
                const startTime = performance.now();
                try {
                    // Using fetch with a timeout
                    const controller = new AbortController();
                    const timeoutId = setTimeout(
                        () => controller.abort(),
                        5000
                    );

                    const response = await fetch(url, {
                        method: "HEAD",
                        signal: controller.signal
                    });

                    clearTimeout(timeoutId);
                    const endTime = performance.now();

                    return {
                        url: url,
                        isUp: response.ok,
                        responseTime: Math.round(endTime - startTime)
                    };
                } catch {
                    const endTime = performance.now();
                    return {
                        url: url,
                        isUp: false,
                        responseTime: Math.round(endTime - startTime)
                    };
                }
            })
        );

        return NextResponse.json(results);
    } catch {
        return NextResponse.json(
            { error: "Failed to check websites status" },
            { status: 500 }
        );
    }
}
