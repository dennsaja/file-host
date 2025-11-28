
export const runtime = 'edge';

export async function GET(req) {
  const url = new URL(req.url).searchParams.get("url");
  return Response.redirect(url);
}
