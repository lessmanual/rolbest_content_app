import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Modal from "@/components/ui/modal";
import { Settings, Upload, Rocket, Save, ExternalLink, Circle, ChevronDown, ChevronUp, Edit } from "lucide-react";
import type { Post } from "@shared/schema";

export default function Dashboard() {
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBlogExpanded, setIsBlogExpanded] = useState(false);
  const [isFacebookExpanded, setIsFacebookExpanded] = useState(false);
  const [isInstagramExpanded, setIsInstagramExpanded] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { toast } = useToast();

  // Fetch current post
  const { data: currentPost, isLoading: isLoadingPost } = useQuery<Post>({
    queryKey: ["/api/post"],
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Fetch published posts
  const { data: publishedPosts = [], isLoading: isLoadingHistory } = useQuery<Post[]>({
    queryKey: ["/api/posts/published"],
  });

  // Update cell mutation
  const updateCellMutation = useMutation({
    mutationFn: async ({ rowId, column, content }: { rowId: string; column: string; content: string }) => {
      return apiRequest("POST", "/api/post/update", { rowId, column, content });
    },
    onError: () => {
      toast({
        title: "Błąd",
        description: "Nie udało się zaktualizować zawartości",
        variant: "destructive",
      });
    },
  });

  // Publish post mutation
  const publishMutation = useMutation({
    mutationFn: async (rowId: string) => {
      return apiRequest("POST", "/api/publish", { rowId });
    },
    onSuccess: () => {
      toast({
        title: "Sukces",
        description: "Post został opublikowany pomyślnie",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/post"] });
      queryClient.invalidateQueries({ queryKey: ["/api/posts/published"] });
    },
    onError: () => {
      toast({
        title: "Błąd",
        description: "Nie udało się opublikować posta",
        variant: "destructive",
      });
    },
  });

  const [tempBlogContent, setTempBlogContent] = useState("");
  const [tempBlogTitle, setTempBlogTitle] = useState("");
  const [tempFacebookContent, setTempFacebookContent] = useState("");
  const [tempInstagramContent, setTempInstagramContent] = useState("");

  // Update temp values when currentPost changes
  useEffect(() => {
    if (currentPost) {
      setTempBlogTitle(currentPost.blogTitle || "");
      setTempBlogContent(currentPost.blogContentHtml || "");
      setTempFacebookContent(currentPost.facebookContent || "");
      setTempInstagramContent(currentPost.instagramContent || "");
    }
  }, [currentPost]);

  const handleContentChange = (column: string, content: string) => {
    if (currentPost) {
      updateCellMutation.mutate({ rowId: currentPost.rowId, column, content });
    }
  };

  const handleSaveChanges = () => {
    if (currentPost) {
      // Save both title and content
      updateCellMutation.mutate({ 
        rowId: currentPost.rowId, 
        column: "blogTitle", 
        content: tempBlogTitle 
      });
      updateCellMutation.mutate({ 
        rowId: currentPost.rowId, 
        column: "blogContentHtml", 
        content: tempBlogContent 
      });
      
      // Switch back to preview mode
      setIsBlogExpanded(false);
      
      // Refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/post"] });
    }
  };

  const handleSaveFacebook = () => {
    if (currentPost) {
      updateCellMutation.mutate({ 
        rowId: currentPost.rowId, 
        column: "facebookContent", 
        content: tempFacebookContent 
      });
      
      // Switch back to preview mode
      setIsFacebookExpanded(false);
      
      // Refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/post"] });
    }
  };

  const handleSaveInstagram = () => {
    if (currentPost) {
      updateCellMutation.mutate({ 
        rowId: currentPost.rowId, 
        column: "instagramContent", 
        content: tempInstagramContent 
      });
      
      // Switch back to preview mode
      setIsInstagramExpanded(false);
      
      // Refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/post"] });
    }
  };

  const handlePublish = () => {
    if (currentPost) {
      publishMutation.mutate(currentPost.rowId);
    }
  };

  const openModal = (post: Post) => {
    setSelectedPost(post);
    setIsModalOpen(true);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Brak daty";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("pl-PL", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return "Nieprawidłowa data";
    }
  };

  return (
    <div className="min-h-screen bg-rolbest-background text-rolbest-foreground">
      {/* Header */}
      <header className="bg-white border-b border-rolbest-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-rolbest-foreground">Panel Publikacji ROLBEST</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-rolbest-muted-foreground flex items-center">
                <Circle className="w-3 h-3 text-green-500 mr-2 fill-current" />
                Połączono z Google Sheets
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setIsSettingsOpen(true)}
                data-testid="button-settings"
              >
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Loading indicator */}
        {(updateCellMutation.isPending || publishMutation.isPending) && (
          <div className="fixed top-4 right-4 bg-rolbest-primary text-white px-4 py-2 rounded-lg shadow-lg z-50">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Synchronizacja z Google Sheets...
            </div>
          </div>
        )}

        {/* Editing Section */}
        <div className="mb-12">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-rolbest-foreground mb-2">Edycja Treści</h2>
            <p className="text-rolbest-muted-foreground">Edytuj treść posta przed publikacją</p>
          </div>

          {isLoadingPost ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rolbest-primary mx-auto"></div>
              <p className="mt-2 text-rolbest-muted-foreground">Ładowanie danych posta...</p>
            </div>
          ) : !currentPost ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-rolbest-muted-foreground">
                  Brak postów na dzisiaj ze statusem "Do akceptacji". Pola są puste, żeby nic się nie pomyliło.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Content Editing */}
              <div className="lg:col-span-2 space-y-6">
                {/* Blog Editor/Preview */}
                <Card>
                  <CardContent className="pt-6">
                    <div 
                      className="flex items-center justify-between mb-4 cursor-pointer"
                      onClick={() => setIsBlogExpanded(!isBlogExpanded)}
                      data-testid="button-toggle-blog"
                    >
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-rolbest-primary rounded-full mr-3"></div>
                        <h3 className="text-lg font-medium text-rolbest-foreground">
                          {isBlogExpanded ? "Edycja Blog Post" : "Podgląd Blog Post"}
                        </h3>
                      </div>
                      {isBlogExpanded ? (
                        <ChevronUp className="w-5 h-5 text-rolbest-muted-foreground" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-rolbest-muted-foreground" />
                      )}
                    </div>
                    
                    {isBlogExpanded ? (
                      // Edit Mode
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-rolbest-foreground mb-2 block">
                            Tytuł Blog Post
                          </label>
                          <Input
                            placeholder="Wpisz tytuł blog posta..."
                            value={tempBlogTitle}
                            onChange={(e) => setTempBlogTitle(e.target.value)}
                            data-testid="input-blog-title"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-rolbest-foreground mb-2 block">
                            Treść Blog Post
                          </label>
                          <Textarea
                            placeholder="Napisz treść blog posta..."
                            className="min-h-48 resize-none"
                            value={tempBlogContent}
                            onChange={(e) => setTempBlogContent(e.target.value)}
                            data-testid="textarea-blog-content"
                          />
                          <div className="flex justify-between items-center mt-2 text-sm text-rolbest-muted-foreground">
                            <span>Zalecana długość: 300-800 słów</span>
                            <span data-testid="text-blog-char-count">
                              {tempBlogContent.length} znaków
                            </span>
                          </div>
                          <div className="flex justify-end mt-4">
                            <Button 
                              onClick={handleSaveChanges}
                              className="bg-rolbest-primary hover:bg-rolbest-primary/90"
                              data-testid="button-save-blog"
                            >
                              <Save className="w-4 h-4 mr-2" />
                              Zapisz zmiany
                            </Button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      // Preview Mode
                      <div className="prose max-w-none">
                        <h4 className="text-xl font-semibold mb-3 text-rolbest-foreground" data-testid="text-blog-title">
                          {currentPost.blogTitle || "Tytuł Blog Posta"}
                        </h4>
                        <div 
                          className="text-rolbest-muted-foreground leading-relaxed prose max-w-none" 
                          data-testid="text-blog-content"
                          dangerouslySetInnerHTML={{
                            __html: currentPost.blogContentHtml || "Treść blog posta zostanie wyświetlona tutaj..."
                          }}
                        ></div>
                        <div className="mt-4 pt-3 border-t border-rolbest-border">
                          <span 
                            className="text-sm text-rolbest-muted-foreground flex items-center cursor-pointer hover:text-rolbest-primary transition-colors"
                            onClick={(e) => {
                              e.preventDefault();
                              setIsBlogExpanded(true);
                            }}
                            data-testid="button-edit-blog"
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Kliknij aby edytować
                          </span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Facebook Post Editor */}
                <Card>
                  <CardContent className="pt-6">
                    <div 
                      className="flex items-center justify-between mb-4 cursor-pointer"
                      onClick={() => setIsFacebookExpanded(!isFacebookExpanded)}
                      data-testid="button-toggle-facebook"
                    >
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
                        <h3 className="text-lg font-medium text-rolbest-foreground">
                          {isFacebookExpanded ? "Edycja Facebook Post" : "Podgląd Facebook Post"}
                        </h3>
                      </div>
                      {isFacebookExpanded ? (
                        <ChevronUp className="w-5 h-5 text-rolbest-muted-foreground" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-rolbest-muted-foreground" />
                      )}
                    </div>
                    
                    {isFacebookExpanded ? (
                      // Edit Mode
                      <div className="space-y-4">
                        <Textarea
                          placeholder="Napisz treść posta na Facebook..."
                          className="min-h-32 resize-none"
                          value={tempFacebookContent}
                          onChange={(e) => setTempFacebookContent(e.target.value)}
                          data-testid="textarea-facebook-content"
                        />
                        <div className="flex justify-between items-center text-sm text-rolbest-muted-foreground">
                          <span>Zalecana długość: 40-80 znaków</span>
                          <span data-testid="text-facebook-char-count">
                            {tempFacebookContent.length}/280
                          </span>
                        </div>
                        <div className="flex justify-end">
                          <Button 
                            onClick={handleSaveFacebook}
                            className="bg-rolbest-primary hover:bg-rolbest-primary/90"
                            data-testid="button-save-facebook"
                          >
                            <Save className="w-4 h-4 mr-2" />
                            Zapisz zmiany
                          </Button>
                        </div>
                      </div>
                    ) : (
                      // Preview Mode
                      <div>
                        <div 
                          className="text-rolbest-muted-foreground leading-relaxed min-h-[80px] p-3 border border-rolbest-border rounded-md bg-rolbest-muted/20" 
                          data-testid="text-facebook-content"
                        >
                          {currentPost.facebookContent || "Treść Facebook posta zostanie wyświetlona tutaj..."}
                        </div>
                        <div className="mt-4 pt-3 border-t border-rolbest-border">
                          <span 
                            className="text-sm text-rolbest-muted-foreground flex items-center cursor-pointer hover:text-rolbest-primary transition-colors"
                            onClick={(e) => {
                              e.preventDefault();
                              setIsFacebookExpanded(true);
                            }}
                            data-testid="button-edit-facebook"
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Kliknij aby edytować
                          </span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Instagram Post Editor */}
                <Card>
                  <CardContent className="pt-6">
                    <div 
                      className="flex items-center justify-between mb-4 cursor-pointer"
                      onClick={() => setIsInstagramExpanded(!isInstagramExpanded)}
                      data-testid="button-toggle-instagram"
                    >
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-pink-600 rounded-full mr-3"></div>
                        <h3 className="text-lg font-medium text-rolbest-foreground">
                          {isInstagramExpanded ? "Edycja Instagram Post" : "Podgląd Instagram Post"}
                        </h3>
                      </div>
                      {isInstagramExpanded ? (
                        <ChevronUp className="w-5 h-5 text-rolbest-muted-foreground" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-rolbest-muted-foreground" />
                      )}
                    </div>
                    
                    {isInstagramExpanded ? (
                      // Edit Mode
                      <div className="space-y-4">
                        <Textarea
                          placeholder="Napisz treść posta na Instagram..."
                          className="min-h-32 resize-none"
                          value={tempInstagramContent}
                          onChange={(e) => setTempInstagramContent(e.target.value)}
                          data-testid="textarea-instagram-content"
                        />
                        <div className="flex justify-between items-center text-sm text-rolbest-muted-foreground">
                          <span>Używaj hashtagów dla lepszego zasięgu</span>
                          <span data-testid="text-instagram-char-count">
                            {tempInstagramContent.length}/2200
                          </span>
                        </div>
                        <div className="flex justify-end">
                          <Button 
                            onClick={handleSaveInstagram}
                            className="bg-rolbest-primary hover:bg-rolbest-primary/90"
                            data-testid="button-save-instagram"
                          >
                            <Save className="w-4 h-4 mr-2" />
                            Zapisz zmiany
                          </Button>
                        </div>
                      </div>
                    ) : (
                      // Preview Mode
                      <div>
                        <div 
                          className="text-rolbest-muted-foreground leading-relaxed min-h-[80px] p-3 border border-rolbest-border rounded-md bg-rolbest-muted/20" 
                          data-testid="text-instagram-content"
                        >
                          {currentPost.instagramContent || "Treść Instagram posta zostanie wyświetlona tutaj..."}
                        </div>
                        <div className="mt-4 pt-3 border-t border-rolbest-border">
                          <span 
                            className="text-sm text-rolbest-muted-foreground flex items-center cursor-pointer hover:text-rolbest-primary transition-colors"
                            onClick={(e) => {
                              e.preventDefault();
                              setIsInstagramExpanded(true);
                            }}
                            data-testid="button-edit-instagram"
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Kliknij aby edytować
                          </span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Preview & Actions */}
              <div className="space-y-6">
                {/* Image Preview */}
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center mb-4">
                      <div className="w-2 h-2 bg-rolbest-primary rounded-full mr-3"></div>
                      <h3 className="text-lg font-medium text-rolbest-foreground">Zdjęcie</h3>
                    </div>
                    <div className="aspect-square bg-rolbest-muted border-2 border-dashed border-rolbest-border rounded-lg flex items-center justify-center mb-4">
                      {currentPost.imageUrl ? (
                        <img
                          src={currentPost.imageUrl}
                          alt="Post image"
                          className="w-full h-full object-cover rounded-lg"
                          data-testid="img-post-preview"
                        />
                      ) : (
                        <div className="text-center text-rolbest-muted-foreground">
                          <Upload className="w-8 h-8 mx-auto mb-2" />
                          <span>Brak zdjęcia</span>
                        </div>
                      )}
                    </div>
                    <Button variant="outline" className="w-full" data-testid="button-change-image">
                      <Upload className="w-4 h-4 mr-2" />
                      Zmień zdjęcie
                    </Button>
                  </CardContent>
                </Card>

                {/* Publish Actions */}
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-rolbest-muted rounded-lg">
                        <span className="text-sm text-rolbest-muted-foreground">Status:</span>
                        <Badge variant="secondary" data-testid="badge-post-status">
                          {currentPost.status}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-rolbest-muted rounded-lg">
                        <span className="text-sm text-rolbest-muted-foreground">ID Wiersza:</span>
                        <span className="font-mono text-sm text-rolbest-foreground" data-testid="text-row-id">
                          {currentPost.rowId}
                        </span>
                      </div>

                      <Button
                        className="w-full bg-rolbest-primary hover:bg-rolbest-primary/90 text-white"
                        onClick={handlePublish}
                        disabled={publishMutation.isPending}
                        data-testid="button-publish"
                      >
                        {publishMutation.isPending ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                            Publikowanie...
                          </>
                        ) : (
                          <>
                            <Rocket className="w-4 h-4 mr-2" />
                            Opublikuj Teraz
                          </>
                        )}
                      </Button>

                      <Button variant="secondary" className="w-full" data-testid="button-save-changes">
                        <Save className="w-4 h-4 mr-2" />
                        Zapisz Zmiany
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>

        {/* History Section */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-semibold text-rolbest-foreground mb-2">Historia Publikacji</h2>
              <p className="text-rolbest-muted-foreground">Ostatnio opublikowane posty</p>
            </div>
            <Button variant="ghost" className="text-rolbest-primary hover:text-rolbest-primary/90" data-testid="link-show-all-history">
              Pokaż całą historię
              <ExternalLink className="w-4 h-4 ml-2" />
            </Button>
          </div>

          {isLoadingHistory ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rolbest-primary mx-auto"></div>
              <p className="mt-2 text-rolbest-muted-foreground">Ładowanie historii...</p>
            </div>
          ) : publishedPosts.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-rolbest-muted-foreground">
                  Brak opublikowanych postów do wyświetlenia.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
              {publishedPosts.slice(0, 5).map((post) => (
                <Card
                  key={post.rowId}
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => openModal(post)}
                  data-testid={`card-history-${post.rowId}`}
                >
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between mb-3">
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        OPUBLIKOWANE
                      </Badge>
                      <span className="text-xs text-rolbest-muted-foreground">
                        {formatDate(post.publishedDate)}
                      </span>
                    </div>

                    {post.imageUrl && (
                      <img
                        src={post.imageUrl}
                        alt="Post thumbnail"
                        className="w-full h-20 object-cover rounded mb-3"
                        data-testid={`img-history-thumbnail-${post.rowId}`}
                      />
                    )}

                    <h4 className="font-medium text-rolbest-foreground text-sm mb-2 line-clamp-2" data-testid={`text-history-title-${post.rowId}`}>
                      {post.blogTitle || "Bez tytułu"}
                    </h4>
                    <p className="text-xs text-rolbest-muted-foreground line-clamp-2" data-testid={`text-history-content-${post.rowId}`}>
                      {post.blogContent || "Brak treści..."}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* History Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Szczegóły Publikacji"
      >
        {selectedPost && (
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <Badge variant="default" className="bg-green-100 text-green-800">
                OPUBLIKOWANE
              </Badge>
              <span className="text-sm text-rolbest-muted-foreground" data-testid="text-modal-date">
                {formatDate(selectedPost.publishedDate)}
              </span>
            </div>

            <div>
              <h4 className="font-medium text-rolbest-foreground mb-2">Tytuł Blog Post</h4>
              <p className="text-rolbest-foreground" data-testid="text-modal-blog-title">
                {selectedPost.blogTitle || "Bez tytułu"}
              </p>
            </div>

            <div>
              <h4 className="font-medium text-rolbest-foreground mb-2">Facebook Post</h4>
              <p className="text-rolbest-muted-foreground bg-rolbest-muted p-3 rounded-lg whitespace-pre-wrap" data-testid="text-modal-facebook-content">
                {selectedPost.facebookContent || "Brak treści"}
              </p>
            </div>

            <div>
              <h4 className="font-medium text-rolbest-foreground mb-2">Instagram Post</h4>
              <p className="text-rolbest-muted-foreground bg-rolbest-muted p-3 rounded-lg whitespace-pre-wrap" data-testid="text-modal-instagram-content">
                {selectedPost.instagramContent || "Brak treści"}
              </p>
            </div>

            {selectedPost.imageUrl && (
              <div>
                <h4 className="font-medium text-rolbest-foreground mb-2">Zdjęcie</h4>
                <img
                  src={selectedPost.imageUrl}
                  alt="Post image"
                  className="w-full h-auto rounded-lg"
                  data-testid="img-modal-image"
                />
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Settings Modal */}
      <Modal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        title="Ustawienia Aplikacji"
      >
        <div className="space-y-6">
          <div>
            <h4 className="font-medium text-rolbest-foreground mb-4">Połączenie z Google Sheets</h4>
            <div className="bg-rolbest-muted p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-rolbest-foreground">Status połączenia</p>
                  <p className="text-xs text-rolbest-muted-foreground">Automatyczne synchronizowanie z arkuszem</p>
                </div>
                <div className="flex items-center text-green-600">
                  <Circle className="w-3 h-3 mr-2 fill-current" />
                  <span className="text-sm">Połączono</span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-rolbest-foreground mb-4">Webhook Make.com</h4>
            <div className="bg-rolbest-muted p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-rolbest-foreground">Publikacja automatyczna</p>
                  <p className="text-xs text-rolbest-muted-foreground">Uruchamianie po kliknięciu "Opublikuj"</p>
                </div>
                <div className="flex items-center text-green-600">
                  <Circle className="w-3 h-3 mr-2 fill-current" />
                  <span className="text-sm">Aktywny</span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-rolbest-foreground mb-4">Informacje o aplikacji</h4>
            <div className="bg-rolbest-muted p-4 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-rolbest-muted-foreground">Wersja aplikacji:</span>
                <span className="text-sm text-rolbest-foreground">1.0.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-rolbest-muted-foreground">Ostatnia aktualizacja:</span>
                <span className="text-sm text-rolbest-foreground">Dzisiaj</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-rolbest-muted-foreground">Panel dla:</span>
                <span className="text-sm text-rolbest-foreground">ROLBEST</span>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
