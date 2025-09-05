export type Visibility = "public" | "members";

export type Channel = {
  id: string;
  handle: string;
  name: string;
  avatarUrl: string | null;
  bannerUrl: string | null;
  description?: string | null;
  ownerUid: string;
  priceId?: string | null;  
  subscriberCount?: number;
  createdAt?: number;
};

export type Video = {
  id: string;
  title: string;
  channelId: string;
  playbackUrl: string;
  
  playbackId?: string | null;
  thumbnailUrl?: string | null;       
  thumbnailVttUrl?: string | null;    
  thumbDefaultTime?: number;   
  visibility: Visibility;
  createdAt: number;
  views?: number;
  tags?: string[];
  description?: string;
  shareUrl?: string | null;
};
