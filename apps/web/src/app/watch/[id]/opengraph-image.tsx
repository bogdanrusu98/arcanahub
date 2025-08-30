export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  // You could fetch the video here too for better titles
  return {
    title: `Watch · ArcanaHub`,
    description: "Tarot videos & live streaming",
    openGraph: {
      title: "ArcanaHub",
      description: "Tarot videos & live streaming",
      url: `/watch/${id}`,
      type: "video.other",
    },
  };
}
