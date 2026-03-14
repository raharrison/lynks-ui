import { Collapse } from 'antd';
import { YoutubeFilled } from '@ant-design/icons';

export default function YouTubeEmbed({ videoId }: { videoId: string }) {
  return (
    <Collapse
      style={{ marginBottom: 16 }}
      items={[{
        key: 'video',
        label: <span><YoutubeFilled style={{ marginRight: 8 }} />Video</span>,
        children: (
          <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, borderRadius: 6, overflow: 'hidden' }}>
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${videoId}`}
              title="YouTube video player"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }}
            />
          </div>
        ),
      }]}
    />
  );
}
