import { useCallback, useState } from "react";

import {
  createFileRoute,
  Link,
  redirect,
  useNavigate,
} from "@tanstack/react-router";

// import { SlidePreview } from '#/features/presentations/components/slide-preview'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "#/components/ui/alert-dialog";
import { Button } from "#/components/ui/button";
import { Label } from "#/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "#/components/ui/select";
import { Slider } from "#/components/ui/slider";
import { Textarea } from "#/components/ui/textarea";
import { GenerationStatus } from "#/features/presentations/components/generation-status";
import { SlideCard } from "#/features/presentations/components/slide-card";
import {
  LAYOUT_OPTIONS,
  SLIDE_STYLES,
  TONE_OPTIONS,
  //   presentationThumbnailUrl,
  //   useFullscreen,
  //   usePresentationDetail,
} from "#/features/presentations/constant/presentation-options";
import { presentationThumbnailUrl } from "#/features/presentations/utils";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Download,
  Maximize,
  Play,
  RefreshCw,
  Save,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { getSession } from "@/lib/auth.functions";

export const Route = createFileRoute("/presentations/$presentationId")({
  component: RouteComponent,
});

function RouteComponent() {
  const { presentationId } = Route.useParams();
  const navigate = useNavigate();

  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [showSlideshow, setShowSlideshow] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const {
    query,
    slides,
    isGenerating,
    updatedLabel,
    form,
    setForm,
    updateMut,
    regenerateMut,
    deleteMut,
  } = usePresentationDetail(presentationId, {
    onDeleted: () => navigate({ to: "/" }),
  });

  if (query.isLoading) {
    return (
      <main className="min-h-screen px-4 pt-24 pb-12">
        <div className="text-muted-foreground mx-auto max-w-6xl">
          Loading Presentation...
        </div>
      </main>
    );
  }

  if (query.isError) {
    const error = query.error;
    return (
      <main className="min-h-screen px-4 pt-24 pb-12">
        <div className="mx-auto max-w-6xl space-y-4">
          <p className="text-destructive">
            {error instanceof Error ? error.message : "Something went wrong"}
          </p>
          <Button asChild variant="outline" className="rounded-xl">
            <Link to="/">Back home</Link>
          </Button>
        </div>
      </main>
    );
  }

  const data = query.data;
  const thumb = presentationThumbnailUrl(data?.id ?? "");
  const activeSlide = slides.at(activeSlideIndex);

  return (
    <main className="min-h-screen px-4 pt-24 pb-12">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="gap-1 rounded-xl"
            >
              <Link to="/">
                <ArrowLeft className="size-4" />
                Home
              </Link>
            </Button>

            <GenerationStatus status={data?.status ?? "DRAFT"} />
          </div>
        </div>

        <div className="flex flex-col gap-6 lg:flex-row">
          <div className="flex-1 space-y-4">
            <div className="glass flex items-center gap-4 rounded-2xl p-4">
              <img
                src={thumb}
                alt=""
                width={56}
                height={56}
                className="border-border/50 bg-background/30 rounded-xl border"
              />
              <div className="min-w-0 flex-1">
                <h1 className="truncate font-semibold">{data?.title}</h1>
                <p className="text-muted-foreground text-sm">
                  {slides.length} slides
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {slides.length > 0 && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1 rounded-xl"
                      onClick={() => setShowSlideshow(true)}
                    >
                      <Play className="size-4" />
                      <span className="hidden sm:inline">Slideshow</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1 rounded-xl"
                      //   onClick={handleExportPptx}
                      disabled={isExporting}
                    >
                      <Download className="size-4" />
                      <span className="hidden sm:inline">
                        {isExporting ? "Exporting…" : "Export"}
                      </span>
                    </Button>
                  </>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1 rounded-xl"
                  disabled={regenerateMut.isPending || isGenerating}
                  onClick={() => regenerateMut.mutate()}
                >
                  <RefreshCw
                    className={`size-4 ${isGenerating ? "animate-spin" : ""}`}
                  />
                  <span className="hidden sm:inline">
                    {isGenerating ? "Generating…" : "Regenerate"}
                  </span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-xl"
                  onClick={() => setShowSettings(!showSettings)}
                >
                  {showSettings ? "Hide settings" : "Edit settings"}
                </Button>
              </div>
            </div>

            {showSettings && (
              <div className="glass space-y-4 rounded-2xl p-6">
                <div className="space-y-2">
                  <Label htmlFor="pres-title" className="text-sm font-medium">
                    Title
                  </Label>
                  <input
                    id="pres-title"
                    value={form.title}
                    onChange={(e) =>
                      setForm((s) => ({
                        ...s,
                        title: e.target.value,
                      }))
                    }
                    className="border-border/50 bg-background/50 focus-visible:ring-primary/30 flex h-10 w-full rounded-xl border px-3 py-2 text-sm outline-none focus-visible:ring-2"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Prompt</Label>
                  <Textarea
                    value={form.prompt}
                    onChange={(e) =>
                      setForm((s) => ({
                        ...s,
                        prompt: e.target.value,
                      }))
                    }
                    className="bg-background/50 border-border/50 min-h-[120px] resize-y rounded-xl text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      Slides: {form.slideCount}
                    </Label>
                    <Slider
                      value={[form.slideCount]}
                      onValueChange={([v]) =>
                        setForm((s) => ({
                          ...s,
                          slideCount: v,
                        }))
                      }
                      min={3}
                      max={20}
                      step={1}
                      className="py-2"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Style</Label>
                    <Select
                      value={form.style}
                      onValueChange={(value) =>
                        setForm((s) => ({
                          ...s,
                          style:
                            value as (typeof SLIDE_STYLES)[number]["value"],
                        }))
                      }
                    >
                      <SelectTrigger className="bg-background/50 border-border/50 rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="glass">
                        {SLIDE_STYLES.map((s) => (
                          <SelectItem key={s.value} value={s.value}>
                            {s.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Tone</Label>
                    <Select
                      value={form.tone}
                      onValueChange={(value) =>
                        setForm((s) => ({
                          ...s,
                          tone: value as (typeof TONE_OPTIONS)[number]["value"],
                        }))
                      }
                    >
                      <SelectTrigger className="bg-background/50 border-border/50 rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="glass">
                        {TONE_OPTIONS.map((t) => (
                          <SelectItem key={t.value} value={t.value}>
                            {t.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Layout</Label>
                    <Select
                      value={form.layout}
                      onValueChange={(value) =>
                        setForm((s) => ({
                          ...s,
                          layout:
                            value as (typeof LAYOUT_OPTIONS)[number]["value"],
                        }))
                      }
                    >
                      <SelectTrigger className="bg-background/50 border-border/50 rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="glass">
                        {LAYOUT_OPTIONS.map((l) => (
                          <SelectItem key={l.value} value={l.value}>
                            {l.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex flex-wrap justify-between gap-3 pt-2">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="gap-2 rounded-xl"
                        disabled={deleteMut.isPending}
                      >
                        <Trash2 className="size-4" />
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="glass">
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Delete presentation?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently
                          delete your presentation and all its slides.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="rounded-xl">
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl"
                          onClick={() => deleteMut.mutate()}
                        >
                          {deleteMut.isPending ? "Deleting…" : "Delete"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                  <Button
                    type="button"
                    size="sm"
                    className="gap-2 rounded-xl"
                    disabled={
                      updateMut.isPending ||
                      !form.title.trim() ||
                      !form.prompt.trim()
                    }
                    onClick={() => updateMut.mutate()}
                  >
                    <Save className="size-4" />
                    {updateMut.isPending ? "Saving…" : "Save changes"}
                  </Button>
                </div>
              </div>
            )}

            {activeSlide && (
              <div className="space-y-3">
                <div id="slide-preview-container" className="group relative">
                  <SlidePreview
                    slide={activeSlide}
                    isFullscreen={isFullscreen}
                  />
                  <Button
                    variant="secondary"
                    size="icon"
                    className={`absolute top-3 right-3 rounded-lg opacity-0 transition-opacity group-hover:opacity-100 ${
                      isFullscreen ? "opacity-100" : ""
                    }`}
                    onClick={toggleFullscreen}
                  >
                    <Maximize className="size-4" />
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1 rounded-xl"
                    disabled={activeSlideIndex === 0}
                    onClick={() =>
                      setActiveSlideIndex((i) => Math.max(0, i - 1))
                    }
                  >
                    <ChevronLeft className="size-4" />
                    Previous
                  </Button>
                  <span className="text-muted-foreground text-sm">
                    {activeSlideIndex + 1} / {slides.length}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1 rounded-xl"
                    disabled={activeSlideIndex >= slides.length - 1}
                    onClick={() =>
                      setActiveSlideIndex((i) =>
                        Math.min(slides.length - 1, i + 1)
                      )
                    }
                  >
                    Next
                    <ChevronRight className="size-4" />
                  </Button>
                </div>
              </div>
            )}

            {slides.length === 0 && !isGenerating && (
              <div className="glass rounded-2xl p-12 text-center">
                <p className="text-muted-foreground mb-4">
                  No slides yet. Click "Regenerate" to create slides from your
                  prompt.
                </p>
                <Button
                  className="gap-2 rounded-xl"
                  onClick={() => regenerateMut.mutate()}
                  disabled={regenerateMut.isPending}
                >
                  <RefreshCw className="size-4" />
                  Generate slides
                </Button>
              </div>
            )}

            {slides.length === 0 && isGenerating && (
              <div className="glass rounded-2xl p-12 text-center">
                <RefreshCw className="text-primary mx-auto mb-4 size-8 animate-spin" />
                <p className="text-muted-foreground">
                  Generating your presentation…
                </p>
                <p className="text-muted-foreground mt-1 text-xs">
                  This may take a minute
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
