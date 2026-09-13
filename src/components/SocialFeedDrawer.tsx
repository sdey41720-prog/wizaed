import React, { useState } from 'react';
import { 
  Heart, 
  MessageCircle, 
  MapPin, 
  Plane, 
  Compass, 
  Send, 
  Sparkles, 
  X,
  Share2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { SocialPost, StoryItem, Destination, Flight, Coordinate } from '../types';
import { playUiClick, playFlyTransitionSound } from '../utils/audio';

interface SocialFeedDrawerProps {
  posts: SocialPost[];
  stories: StoryItem[];
  onFlyToCoordinate: (coord: Coordinate) => void;
  onSelectFlight: (flight: Flight) => void;
  flights: Flight[];
  destinations: Destination[];
  onAddPost: (newPost: SocialPost) => void;
  isCreateModalOpen: boolean;
  setIsCreateModalOpen: (open: boolean) => void;
}

export const SocialFeedDrawer: React.FC<SocialFeedDrawerProps> = ({
  posts,
  stories,
  onFlyToCoordinate,
  onSelectFlight,
  flights,
  destinations,
  onAddPost,
  isCreateModalOpen,
  setIsCreateModalOpen,
}) => {
  const [activeStory, setActiveStory] = useState<StoryItem | null>(null);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set(['post-2']));
  const [commentsMap, setCommentsMap] = useState<Record<string, string[]>>({});
  const [activeCommentInput, setActiveCommentInput] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');

  // Create Post Form
  const [postContent, setPostContent] = useState('');
  const [selectedCityId, setSelectedCityId] = useState(destinations[0]?.id || 'tokyo');
  const [selectedFlightId, setSelectedFlightId] = useState('');
  const [customPhotoUrl, setCustomPhotoUrl] = useState('');

  const handleLike = (postId: string) => {
    const updated = new Set(likedPosts);
    if (updated.has(postId)) {
      updated.delete(postId);
    } else {
      updated.add(postId);
      playUiClick();
    }
    setLikedPosts(updated);
  };

  const handleAddComment = (postId: string) => {
    if (!commentText.trim()) return;
    const existing = commentsMap[postId] || [];
    setCommentsMap({
      ...commentsMap,
      [postId]: [...existing, `Alex: ${commentText.trim()}`],
    });
    setCommentText('');
    playUiClick();
  };

  const handlePublishPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postContent.trim()) return;

    const dest = destinations.find(d => d.id === selectedCityId) || destinations[0];
    const fl = flights.find(f => f.id === selectedFlightId);

    const newPost: SocialPost = {
      id: `post-${Date.now()}`,
      author: {
        id: 'user-current',
        name: 'Alex Rivera',
        handle: '@alex_voyager',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
        badge: 'Globe Explorer',
      },
      timestamp: 'Just now',
      location: {
        name: dest.name + ', ' + dest.country,
        coord: dest.coord,
      },
      content: postContent,
      images: customPhotoUrl ? [customPhotoUrl] : [dest.coverImage],
      flightNumber: fl?.flightNumber,
      likes: 1,
      commentsCount: 0,
      tags: ['#WizardMap', '#IndiaTraveler', `#${dest.name.replace(/\s+/g, '')}`],
    };

    onAddPost(newPost);
    setIsCreateModalOpen(false);
    setPostContent('');
    setCustomPhotoUrl('');
    try {
      confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });
    } catch {}
  };

  return (
    <div id="social-feed-container" className="fixed inset-0 top-18 sm:top-20 z-20 p-3 sm:p-6 overflow-y-auto pointer-events-none flex justify-center">
      <div 
        id="social-feed-card"
        className="w-full max-w-2xl bg-slate-950/90 backdrop-blur-2xl border border-slate-800/90 rounded-3xl p-5 sm:p-7 shadow-2xl pointer-events-auto text-white flex flex-col gap-6"
      >
        {/* Header with Stories Carousel */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <h1 className="font-extrabold text-sm font-mono uppercase tracking-wider text-white">Live Traveler Stories</h1>
            </div>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="text-xs px-3 py-1.5 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 hover:brightness-110 font-bold transition flex items-center gap-1.5 active:scale-95"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Post Update</span>
            </button>
          </div>

          {/* Stories Tray */}
          <div className="flex items-center gap-3 overflow-x-auto pb-2 border-b border-slate-800">
            {stories.map(story => (
              <button
                key={story.id}
                onClick={() => {
                  setActiveStory(story);
                  onFlyToCoordinate(story.coord);
                  playFlyTransitionSound();
                }}
                className="flex flex-col items-center gap-1 shrink-0 group"
              >
                <div className="relative p-0.5 rounded-full bg-gradient-to-tr from-sky-400 via-rose-500 to-amber-400 group-hover:scale-105 transition">
                  <img
                    src={story.authorAvatar}
                    alt={story.authorName}
                    className="w-13 h-13 rounded-full object-cover border-2 border-slate-950"
                  />
                  {story.hasUnseen && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-rose-500 border-2 border-slate-950 animate-pulse" />
                  )}
                </div>
                <span className="text-[10px] text-slate-300 font-semibold truncate max-w-16 text-center">
                  {story.city}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Live Social Posts Stream */}
        <div className="space-y-5">
          {posts.map(post => {
            const isLiked = likedPosts.has(post.id);
            const extraComments = commentsMap[post.id] || [];

            return (
              <article 
                key={post.id}
                className="p-5 rounded-3xl bg-slate-900/70 border border-slate-800/80 shadow-xl space-y-3.5 hover:border-slate-700 transition"
              >
                {/* Author Info & Fly-To button */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={post.author.avatar}
                      alt={post.author.name}
                      className="w-10 h-10 rounded-full object-cover border border-slate-700"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-sm text-white">{post.author.name}</span>
                        {post.author.badge && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-400 font-mono font-semibold">
                            {post.author.badge}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-2">
                        <span>{post.author.handle}</span>
                        <span>•</span>
                        <span>{post.timestamp}</span>
                      </div>
                    </div>
                  </div>

                  {/* Location Fly-To Trigger */}
                  <button
                    onClick={() => {
                      onFlyToCoordinate(post.location.coord);
                      playFlyTransitionSound();
                    }}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-sky-500/20 text-slate-300 hover:text-sky-400 text-xs font-mono transition"
                    title="View post location on 3D globe"
                  >
                    <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    <span className="truncate max-w-28">{post.location.name.split(',')[0]}</span>
                  </button>
                </div>

                {/* Content text */}
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">{post.content}</p>

                {/* Flight Check-In Badge (if flight associated) */}
                {post.flightNumber && (
                  <div className="p-2.5 rounded-2xl bg-sky-950/40 border border-sky-500/30 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 font-mono">
                      <Plane className="w-4 h-4 text-sky-400 rotate-45" />
                      <span className="font-bold text-white">Checked in on flight {post.flightNumber}</span>
                    </div>
                    <button
                      onClick={() => {
                        const fl = flights.find(f => f.flightNumber === post.flightNumber);
                        if (fl) onSelectFlight(fl);
                      }}
                      className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-sky-500 text-white hover:bg-sky-400 transition"
                    >
                      Track Flight
                    </button>
                  </div>
                )}

                {/* Post Images */}
                {post.images.length > 0 && (
                  <div className={`grid gap-2 rounded-2xl overflow-hidden ${post.images.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                    {post.images.map((img, i) => (
                      <img
                        key={i}
                        src={img}
                        alt="travel scene"
                        className="w-full h-48 sm:h-56 object-cover hover:scale-102 transition duration-500"
                      />
                    ))}
                  </div>
                )}

                {/* Hashtags */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {post.tags.map((tag, i) => (
                    <span key={i} className="text-[11px] text-sky-400 hover:underline cursor-pointer">
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Engagement Bar */}
                <div className="flex items-center justify-between border-t border-slate-800 pt-3 text-xs text-slate-400">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => handleLike(post.id)}
                      className={`flex items-center gap-1.5 transition ${
                        isLiked ? 'text-rose-500 font-bold' : 'hover:text-white'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${isLiked ? 'fill-rose-500' : ''}`} />
                      <span>{post.likes + (isLiked ? 1 : 0)}</span>
                    </button>

                    <button
                      onClick={() => setActiveCommentInput(activeCommentInput === post.id ? null : post.id)}
                      className="flex items-center gap-1.5 hover:text-white transition"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>{post.commentsCount + extraComments.length}</span>
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      onFlyToCoordinate(post.location.coord);
                      playFlyTransitionSound();
                    }}
                    className="flex items-center gap-1 text-[11px] text-sky-400 hover:text-sky-300 font-mono"
                  >
                    <Compass className="w-3.5 h-3.5" />
                    <span>View on 3D Globe</span>
                  </button>
                </div>

                {/* Comments Thread & Input */}
                {extraComments.length > 0 && (
                  <div className="pt-2 space-y-1 text-xs border-t border-slate-800/60 font-mono">
                    {extraComments.map((cmt, idx) => (
                      <div key={idx} className="p-1.5 rounded-lg bg-slate-950/50 text-slate-300">
                        {cmt}
                      </div>
                    ))}
                  </div>
                )}

                {activeCommentInput === post.id && (
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                    <input
                      type="text"
                      placeholder="Add a travel comment or tip..."
                      value={commentText}
                      onChange={e => setCommentText(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleAddComment(post.id)}
                      className="flex-1 p-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white outline-none focus:border-sky-400"
                    />
                    <button
                      onClick={() => handleAddComment(post.id)}
                      className="p-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

              </article>
            );
          })}
        </div>
      </div>

      {/* Story Preview Modal */}
      {activeStory && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 pointer-events-auto">
          <div className="relative w-full max-w-sm rounded-3xl overflow-hidden bg-slate-950 border border-slate-700 shadow-2xl">
            <img src={activeStory.previewImage} alt="Story" className="w-full h-96 object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-black/40" />

            {/* Header */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <img src={activeStory.authorAvatar} alt="" className="w-8 h-8 rounded-full border border-white" />
                <div>
                  <div className="font-bold text-xs">{activeStory.authorName}</div>
                  <div className="text-[10px] text-slate-300">{activeStory.city} • Live Travel Story</div>
                </div>
              </div>
              <button onClick={() => setActiveStory(null)} className="p-1 rounded-full bg-black/40 text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Bottom Actions */}
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
              <button
                onClick={() => {
                  onFlyToCoordinate(activeStory.coord);
                  setActiveStory(null);
                }}
                className="px-3 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs flex items-center gap-1.5"
              >
                <Compass className="w-4 h-4" />
                <span>Fly to {activeStory.city}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Travel Post Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 pointer-events-auto">
          <div className="w-full max-w-md rounded-3xl bg-slate-950 border border-sky-500/40 p-6 shadow-2xl text-white">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
              <h2 className="text-base font-bold flex items-center gap-2">
                <Share2 className="w-5 h-5 text-sky-400" />
                <span>Share Live Travel Update</span>
              </h2>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePublishPost} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-mono mb-1">What are you exploring?</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Share a scenic view, local dining spot, or flight experience..."
                  value={postContent}
                  onChange={e => setPostContent(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-white outline-none focus:border-sky-400 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-mono mb-1">Location / Destination</label>
                  <select
                    value={selectedCityId}
                    onChange={e => setSelectedCityId(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white outline-none focus:border-sky-400"
                  >
                    {destinations.map(d => (
                      <option key={d.id} value={d.id}>{d.name}, {d.country}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-mono mb-1">In-Flight Tag (Optional)</label>
                  <select
                    value={selectedFlightId}
                    onChange={e => setSelectedFlightId(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white outline-none focus:border-sky-400"
                  >
                    <option value="">None (On Ground)</option>
                    {flights.map(f => (
                      <option key={f.id} value={f.id}>{f.flightNumber} ({f.origin.code} ➔ {f.destination.code})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-mono mb-1">Photo URL (Optional)</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={customPhotoUrl}
                  onChange={e => setCustomPhotoUrl(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white outline-none focus:border-sky-400"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 text-white font-bold tracking-wide hover:brightness-110 shadow-lg shadow-rose-500/25 transition"
              >
                Publish Live to Followers
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
