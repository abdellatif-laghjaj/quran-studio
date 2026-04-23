export interface PixabayVideoSize {
  url: string
  width: number
  height: number
  size: number
}

export interface PixabayVideoHit {
  id: number
  page_url: string
  type: string
  tags: string
  duration: number
  videos: {
    large: PixabayVideoSize
    medium: PixabayVideoSize
    small: PixabayVideoSize
    tiny: PixabayVideoSize
  }
  user: string
  user_id: number
  user_image_url: string
  picture_id: string
}

export interface PixabaySearchResponse {
  total: number
  total_hits: number
  hits: PixabayVideoHit[]
}
