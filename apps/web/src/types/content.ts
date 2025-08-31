export type Visibility = "public" | "members";

export type Channel = {
  id: string;
  handle: string;
  name: string;
  ownerUid: string;
  avatarUrl?: string | null;
  priceId?: string;
};

export type Video = {
  id: string;
  title: string;
  channelId: string;
  playbackUrl: string;
  
  playbackId?: string | null;
  thumbnailUrl?: string | null;
  visibility: Visibility;
  createdAt: number;
  views?: number;
  tags?: string[];
  description?: string;
  shareUrl?: string | null;
};
