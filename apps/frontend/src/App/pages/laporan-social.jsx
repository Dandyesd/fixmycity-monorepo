import { MoreHorizontal, MessageSquare, Search, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../components/ui/avatar";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContexts";

// --- Helper Functions ---

function formatTimeAgo(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.round((now - date) / 1000);
  const minutes = Math.round(seconds / 60);
  const hours = Math.round(minutes / 60);
  const days = Math.round(hours / 24);

  if (seconds < 60) return `${seconds} detik yang lalu`;
  if (minutes < 60) return `${minutes} menit yang lalu`;
  if (hours < 24) return `${hours} jam yang lalu`;
  return `${days} hari yang lalu`;
}

const statusMap = {
  PENDING: { text: "PENDING", variant: "destructive" },
  DIPROSES: { text: "DIPROSES", variant: "warning" },
  SELESAI: { text: "SELESAI", variant: "success" },
};

// --- Main Component ---

function SocialFeed() {
  const [postsData, setPostsData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [activeCommentPostId, setActiveCommentPostId] = useState(null);
  const [newCommentText, setNewCommentText] = useState("");

  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      const apiUrl = import.meta.env.VITE_API_URL;

      if (!apiUrl) {
        setError("API URL is not configured. Please set VITE_API_URL in your .env file.");
        setIsLoading(false);
        return;
      }

      try {
        const [reportsResponse, usersResponse] = await Promise.all([
          fetch(`${apiUrl}/report`),
          fetch(`${apiUrl}/user/all`),
        ]);

        if (!reportsResponse.ok) throw new Error(`Failed to fetch reports: Status ${reportsResponse.status}`);
        if (!usersResponse.ok) throw new Error(`Failed to fetch users: Status ${usersResponse.status}`);

        const reports = await reportsResponse.json();
        const { data: users } = await usersResponse.json();

        const userMap = new Map(users.map((user) => [user.id_user, user]));

        const transformedPosts = reports.map((report) => {
          const author = userMap.get(report.userId) || {
            user_name: "Unknown User",
            user_profile: null,
          };
          return {
            id: report.id,
            author: author.user_name,
            authorAvatar: author.user_profile,
            time: formatTimeAgo(report.createdAt),
            title: report.title, // Added title field
            location: report.location,
            description: report.description,
            image: report.imageUrl,
            status: statusMap[report.status]?.text || "Unknown",
            // Menambahkan userId ke setiap comment untuk pengecekan kepemilikan
            commentsList: report.comments.map((comment) => ({
              id: comment.id,
              user: userMap.get(comment.userId)?.user_name || "Guest",
              text: comment.text,
              userId: comment.userId, // Penting untuk fitur delete
            })),
          };
        });
        setPostsData(transformedPosts);
      } catch (err) {
        setError(err.message);
        console.error("Error fetching social feed data:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredPosts = postsData.filter((post) => {
    const searchTermLower = searchTerm.toLowerCase();
    const matchesSearch =
      post.description.toLowerCase().includes(searchTermLower) ||
      post.author.toLowerCase().includes(searchTermLower) ||
      (post.title && post.title.toLowerCase().includes(searchTermLower)) || // Added title to search
      (post.location && post.location.toLowerCase().includes(searchTermLower));
    const matchesStatus =
      statusFilter === "all" || post.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const toggleCommentSection = (postId) => {
    setActiveCommentPostId((currentOpenId) =>
      currentOpenId === postId ? null : postId
    );
    setNewCommentText("");
  };

  const handleAddComment = async (postId) => {
    if (!newCommentText.trim()) return;
    if (!user) {
      alert("You must be logged in to post a comment.");
      return;
    }

    const loggedInUserId = user.id_user;

    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      const token = localStorage.getItem("token");

      const response = await fetch(`${apiUrl}/comment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          text: newCommentText,
          reportId: postId,
          userId: loggedInUserId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Backend error:", errorData);
        throw new Error(`Failed to post comment: Status ${response.status}`);
      }

      const newCommentFromServer = await response.json();
      
      // Refresh data untuk mendapatkan comment terbaru dengan ID dan userId yang benar
      const newCommentForUI = {
        id: newCommentFromServer.id,
        user: user.user_name, // Tampilkan nama user langsung
        text: newCommentFromServer.text,
        userId: loggedInUserId,
      };

      setPostsData((prevPosts) =>
        prevPosts.map((post) => {
          if (post.id === postId) {
            return {
              ...post,
              commentsList: [...post.commentsList, newCommentForUI],
            };
          }
          return post;
        })
      );
      setNewCommentText("");
    } catch (err) {
      console.error("Error adding comment:", err);
      alert("Could not post your comment. Please try again.");
    }
  };

  // --- FUNGSI BARU UNTUK HAPUS KOMENTAR ---
  const handleDeleteComment = async (commentId, postId) => {
    if (!window.confirm("Are you sure you want to delete this comment?")) {
      return;
    }

    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      const token = localStorage.getItem("token");
      const response = await fetch(`${apiUrl}/comment/${commentId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete comment.");
      }

      // Update state secara lokal untuk menghilangkan komentar
      setPostsData(prevPosts =>
        prevPosts.map(post => {
          if (post.id === postId) {
            return {
              ...post,
              commentsList: post.commentsList.filter(c => c.id !== commentId),
            };
          }
          return post;
        })
      );

    } catch (err) {
      console.error("Error deleting comment:", err);
      alert("Could not delete comment. Please try again.");
    }
  };


  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen">Loading posts...</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center min-h-screen text-red-500">Error: {error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex font-header">
      <div className="w-64 p-4 border-r bg-white">
        <h2 className="text-3xl font-bold mb-4">FILTER</h2>
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search posts..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Status</label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="PENDING">PENDING</SelectItem>
                <SelectItem value="DIPROSES">DIPROSES</SelectItem>
                <SelectItem value="SELESAI">SELESAI</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="flex-1 p-4">
        <div className="max-w-2xl mx-auto space-y-4">
          {filteredPosts.length > 0 ? (
            filteredPosts.map((post) => (
              <Card key={post.id} className="overflow-hidden">
                <CardHeader className="p-4 pb-0">
                  <div className="flex justify-between items-start">
                    <div className="flex items-start space-x-3">
                      <Avatar>
                        <AvatarImage
                          src={post.authorAvatar || "/placeholder-avatar.svg"}
                          alt={post.author}
                        />
                        <AvatarFallback>{post.author.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{post.author}</div>
                        <div className="text-xs text-gray-500">{post.time}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge
                        variant={Object.values(statusMap).find((s) => s.text === post.status)?.variant || "default"}
                        className="capitalize"
                      >
                        {post.status}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4 font-body">
                  {/* Added title display */}
                  {post.title && (
                    <h4 className="text-lg font-semibold text-gray-800 mb-2">{post.title}</h4>
                  )}
                  {post.location && (
                    <p className="text-sm text-gray-700 font-semibold mb-1">Lokasi: {post.location}</p>
                  )}
                  <p className="mb-3 text-gray-800">{post.description}</p>
                  {post.image && (
                    <div className="rounded-md overflow-hidden mb-3 border">
                      <img
                        src={post.image}
                        alt={`Post by ${post.author}`}
                        className="w-full h-auto object-cover"
                      />
                    </div>
                  )}
                  <div className="flex items-center text-sm text-gray-500 mb-3">
                    <span className="flex items-center mr-4 cursor-pointer" onClick={() => toggleCommentSection(post.id)}>
                      <MessageSquare className="h-4 w-4 mr-1" /> {post.commentsList.length} comments
                    </span>
                  </div>
                  <div className="flex border-t pt-3">
                    <Button variant="ghost" size="sm" className="flex-1 text-gray-600 hover:text-blue-500" onClick={() => toggleCommentSection(post.id)}>
                      <MessageSquare className="h-4 w-4 mr-2" /> COMMENT
                    </Button>
                  </div>
                  {activeCommentPostId === post.id && (
                    <div className="mt-4 pt-4 border-t">
                      <h4 className="text-sm font-semibold mb-3">Comments ({post.commentsList.length})</h4>
                      <div className="space-y-3 max-h-48 overflow-y-auto mb-4 pr-2">
                        {post.commentsList.length > 0 ? (
                          [...post.commentsList].reverse().map((comment) => (
                            <div key={comment.id} className="flex justify-between items-center text-xs bg-gray-100 p-2 rounded-md shadow-sm">
                              <div>
                                <span className="font-semibold text-gray-700">{comment.user}: </span>
                                <span className="text-gray-600">{comment.text}</span>
                              </div>
                              {/* --- TOMBOL HAPUS KOMENTAR --- */}
                              {user && (user.id_user === comment.userId || user.role.role_name === 'admin') && (
                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleDeleteComment(comment.id, post.id)}>
                                  <Trash2 className="h-4 w-4 text-red-500 hover:text-red-700" />
                                </Button>
                              )}
                            </div>
                          ))
                        ) : (
                          <p className="text-xs text-gray-500">No comments yet. Be the first to comment!</p>
                        )}
                      </div>
                      {user ? (
                        <div className="flex space-x-2 items-center">
                          <Avatar size="sm" className="w-8 h-8">
                            <AvatarImage src={user.user_profile || "/placeholder-avatar.svg"}/>
                            <AvatarFallback>{user.user_name.charAt(0).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <Input
                            type="text"
                            placeholder="Write a comment..."
                            value={newCommentText}
                            onChange={(e) => setNewCommentText(e.target.value)}
                            className="flex-1 text-sm"
                            onKeyPress={(e) => {
                              if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                handleAddComment(post.id);
                              }
                            }}
                          />
                          <Button onClick={() => handleAddComment(post.id)} size="sm">Post</Button>
                        </div>
                      ) : (
                        <p className="text-sm text-center text-gray-500 p-2 bg-gray-100 rounded-md">Please log in to leave a comment.</p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center text-gray-500 py-10">
              <p className="text-xl">No posts match your criteria.</p>
              <p>Try adjusting your search or status filter.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SocialFeed;