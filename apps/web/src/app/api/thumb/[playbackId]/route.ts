// // apps/web/src/app/api/thumb/[playbackId]/route.ts
// import { NextRequest, NextResponse } from "next/server";

// export async function GET(
//   request: NextRequest,
//   { params }: { params: { playbackId: string } }
// ) {
//   const { searchParams } = new URL(request.url);
//   const time = Math.max(0, parseInt(searchParams.get("time") || "5"));
//   const { playbackId } = params;

//   if (!playbackId) {
//     return new NextResponse("Missing playbackId", { status: 400 });
//   }

//   try {
//     // Încearcă multiple endpoint-uri Livepeer
//     const endpoints = [
//       // Studio API (dacă ai cheie)
//       process.env.LIVEPEER_API_KEY ? 
//         `https://livepeer.studio/api/playback/${playbackId}/thumbnail.jpg?time=${time}` : null,
      
//       // CDN public endpoints
//       `https://livepeercdn.com/thumbnail/${playbackId}.jpg?time=${time}`,
//       `https://livepeercdn.com/hls/${playbackId}/thumbnail.jpg?time=${time}`,
      
//       // Alternative CDN
//       `https://livepeer-cdn.com/thumbnail/${playbackId}.jpg?time=${time}`,
//     ].filter(Boolean) as string[];

//     for (const endpoint of endpoints) {
//       try {
//         const headers: Record<string, string> = {
//           'User-Agent': 'ArcanaHub-Thumbnail-Proxy/1.0',
//         };
        
//         // Doar pentru Studio API
//         if (endpoint.includes('livepeer.studio') && process.env.LIVEPEER_API_KEY) {
//           headers['Authorization'] = `Bearer ${process.env.LIVEPEER_API_KEY}`;
//         }

//         const response = await fetch(endpoint, {
//           headers,
//           signal: AbortSignal.timeout(5000), // 5s timeout
//         });

//         if (response.ok && response.headers.get('content-type')?.startsWith('image/')) {
//           const buffer = await response.arrayBuffer();
          
//           return new NextResponse(buffer, {
//             headers: {
//               "Content-Type": "image/jpeg",
//               "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
//               "X-Thumbnail-Source": new URL(endpoint).hostname,
//             },
//           });
//         }
//       } catch (error) {
//         console.log(`Failed to fetch from ${endpoint}:`, error);
//         continue;
//       }
//     }

//     // Dacă toate eșuează, redirecționează la fallback OG
//     const fallbackUrl = new URL("/thumb/frame", request.url);
//     fallbackUrl.searchParams.set("playbackId", playbackId);
//     fallbackUrl.searchParams.set("title", `Video ${playbackId.slice(0, 8)}`);
//     fallbackUrl.searchParams.set("t", time.toString());

//     return NextResponse.redirect(fallbackUrl.toString());

//   } catch (error) {
//     console.error(`Thumbnail proxy error for ${playbackId}:`, error);
    
//     // Fallback direct la OG generator
//     return NextResponse.redirect(
//       new URL(`/thumb/frame?playbackId=${playbackId}&title=Video&t=${time}`, request.url)
//     );
//   }
// }