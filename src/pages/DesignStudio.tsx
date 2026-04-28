import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Sparkles,
  Wand2,
  Shirt,
  Coffee,
  Sticker,
  Download,
  CheckCircle2,
  Loader2,
  Palette,
  Type,
  Layout,
  Zap,
} from "lucide-react";

const productTypes = [
  { id: "tshirt", name: "T-Shirt", icon: <Shirt className="h-5 w-5" />, basePrice: 24.99 },
  { id: "hoodie", name: "Hoodie", icon: <Shirt className="h-5 w-5" />, basePrice: 44.99 },
  { id: "mug", name: "Mug", icon: <Coffee className="h-5 w-5" />, basePrice: 14.99 },
  { id: "sticker", name: "Sticker", icon: <Sticker className="h-5 w-5" />, basePrice: 3.99 },
  { id: "poster", name: "Poster", icon: <Layout className="h-5 w-5" />, basePrice: 19.99 },
];

const designStyles = [
  { id: "minimal", name: "Minimal", desc: "Clean lines, simple typography" },
  { id: "retro", name: "Retro", desc: "Vintage aesthetics, bold colors" },
  { id: "abstract", name: "Abstract", desc: "Geometric shapes, fluid art" },
  { id: "streetwear", name: "Streetwear", desc: "Urban, gritty, statement pieces" },
  { id: "nature", name: "Nature", desc: "Organic, earthy, botanical" },
];

// Simulated AI design generation
function generateMockDesign(prompt: string, style: string, productType: string) {
  const seed = prompt.split("").reduce((a, b) => a + b.charCodeAt(0), 0);
  const colors = [
    ["#FF6B6B", "#4ECDC4", "#45B7D1"],
    ["#F7DC6F", "#BB8FCE", "#85C1E2"],
    ["#2ECC71", "#E74C3C", "#3498DB"],
    ["#1ABC9C", "#F39C12", "#9B59B6"],
    ["#34495E", "#E67E22", "#16A085"],
  ];
  const colorSet = colors[seed % colors.length];
  
  return {
    id: `design_${Date.now()}`,
    prompt,
    style,
    productType,
    colors: colorSet,
    mockupUrl: `https://images.unsplash.com/photo-${1500000000000 + (seed % 1000000)}?w=600&h=600&fit=crop`,
    createdAt: new Date(),
  };
}

export default function DesignStudio() {
  const [prompt, setPrompt] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("minimal");
  const [selectedProduct, setSelectedProduct] = useState("tshirt");
  const [generating, setGenerating] = useState(false);
  const [generatedDesigns, setGeneratedDesigns] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("generate");

  const handleGenerate = () => {
    if (!prompt.trim()) {
      toast.error("Enter a design prompt first");
      return;
    }
    setGenerating(true);
    // Simulate AI generation delay
    setTimeout(() => {
      const design = generateMockDesign(prompt, selectedStyle, selectedProduct);
      setGeneratedDesigns((prev) => [design, ...prev]);
      setGenerating(false);
      toast.success("Design generated!");
    }, 2000);
  };

  const handlePublish = (_design: any) => {
    toast.success("Design published to store!", {
      description: "Your product is now live at /shop",
    });
  };

  const handleScheduleSocial = (_design: any) => {
    toast.success("Social posts scheduled!", {
      description: "Auto-posting across connected platforms",
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">AI Design Studio</h1>
            <p className="text-sm text-muted-foreground">
              Generate designs from prompts, create mockups, and auto-publish to your store.
            </p>
          </div>
          <Badge variant="secondary" className="gap-1">
            <Zap className="h-3 w-3" />
            AI-Powered
          </Badge>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="generate" className="gap-2">
              <Wand2 className="h-4 w-4" />
              Generate
            </TabsTrigger>
            <TabsTrigger value="gallery" className="gap-2">
              <Palette className="h-4 w-4" />
              Gallery ({generatedDesigns.length})
            </TabsTrigger>
            <TabsTrigger value="templates" className="gap-2">
              <Layout className="h-4 w-4" />
              Templates
            </TabsTrigger>
          </TabsList>

          <TabsContent value="generate" className="space-y-6">
            {/* Prompt Input */}
            <Card className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Design Prompt</label>
                  <Textarea
                    placeholder="Describe your design... e.g. 'A vintage sunset over ocean waves with retro typography saying Chase the Daze'"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="min-h-[100px]"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Tip: Include subject, style, colors, and any text you want in the design.
                  </p>
                </div>

                {/* Style Selector */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Style</label>
                  <div className="flex flex-wrap gap-2">
                    {designStyles.map((style) => (
                      <button
                        key={style.id}
                        onClick={() => setSelectedStyle(style.id)}
                        className={`rounded-lg border px-4 py-2 text-sm transition-colors ${
                          selectedStyle === style.id
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <span className="font-medium">{style.name}</span>
                        <span className="text-muted-foreground text-xs block">{style.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Product Selector */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Product Type</label>
                  <div className="flex flex-wrap gap-2">
                    {productTypes.map((product) => (
                      <button
                        key={product.id}
                        onClick={() => setSelectedProduct(product.id)}
                        className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm transition-colors ${
                          selectedProduct === product.id
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        {product.icon}
                        <div className="text-left">
                          <span className="font-medium">{product.name}</span>
                          <span className="text-muted-foreground text-xs block">From ${product.basePrice}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <Button
                  className="w-full h-12 gap-2"
                  onClick={handleGenerate}
                  disabled={generating || !prompt.trim()}
                >
                  {generating ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Generating design...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-5 w-5" />
                      Generate Design
                    </>
                  )}
                </Button>
              </div>
            </Card>

            {/* Recent Generations */}
            {generatedDesigns.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Recent Generations</h3>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {generatedDesigns.slice(0, 3).map((design) => (
                    <Card key={design.id} className="overflow-hidden">
                      <div className="aspect-square bg-gradient-to-br from-primary/5 to-accent/5 flex items-center justify-center">
                        <div className="text-center p-6">
                          <div className="flex gap-1 justify-center mb-3">
                            {design.colors.map((c: string) => (
                              <div key={c} className="h-8 w-8 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: c }} />
                            ))}
                          </div>
                          <p className="text-sm font-medium">{design.prompt.slice(0, 40)}...</p>
                          <p className="text-xs text-muted-foreground capitalize mt-1">{design.style} · {design.productType}</p>
                        </div>
                      </div>
                      <div className="p-4 space-y-2">
                        <Button className="w-full gap-2" size="sm" onClick={() => handlePublish(design)}>
                          <CheckCircle2 className="h-4 w-4" />
                          Publish to Store
                        </Button>
                        <Button variant="outline" className="w-full gap-2" size="sm" onClick={() => handleScheduleSocial(design)}>
                          <Zap className="h-4 w-4" />
                          Auto-Post Social
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="gallery" className="space-y-6">
            {generatedDesigns.length === 0 ? (
              <div className="text-center py-16">
                <Palette className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No designs yet. Generate your first one!</p>
                <Button className="mt-4" onClick={() => setActiveTab("generate")}>
                  Go to Generator
                </Button>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {generatedDesigns.map((design) => (
                  <Card key={design.id} className="overflow-hidden">
                    <div className="aspect-square bg-gradient-to-br from-primary/5 to-accent/5 flex items-center justify-center">
                      <div className="text-center p-6">
                        <div className="flex gap-1 justify-center mb-3">
                          {design.colors.map((c: string) => (
                            <div key={c} className="h-8 w-8 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: c }} />
                          ))}
                        </div>
                        <p className="text-sm font-medium">{design.prompt.slice(0, 50)}...</p>
                        <p className="text-xs text-muted-foreground capitalize mt-1">{design.style} · {design.productType}</p>
                      </div>
                    </div>
                    <div className="p-4 space-y-2">
                      <div className="flex gap-2">
                        <Button className="flex-1 gap-1" size="sm" onClick={() => handlePublish(design)}>
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Publish
                        </Button>
                        <Button variant="outline" className="flex-1 gap-1" size="sm" onClick={() => handleScheduleSocial(design)}>
                          <Zap className="h-3.5 w-3.5" />
                          Social
                        </Button>
                      </div>
                      <Button variant="ghost" className="w-full gap-1" size="sm">
                        <Download className="h-3.5 w-3.5" />
                        Download Assets
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="templates" className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { name: "Minimal Quote", style: "minimal", desc: "Clean typography with subtle accent" },
                { name: "Retro Badge", style: "retro", desc: "Vintage circular badge design" },
                { name: "Abstract Waves", style: "abstract", desc: "Fluid geometric patterns" },
                { name: "Street Script", style: "streetwear", desc: "Bold graffiti-style lettering" },
                { name: "Botanical Line", style: "nature", desc: "Minimal plant illustrations" },
                { name: "Gradient Glow", style: "abstract", desc: "Soft gradient backgrounds" },
              ].map((template, i) => (
                <Card key={i} className="p-5 cursor-pointer hover:border-primary/40 transition-all" onClick={() => {
                  setPrompt(`Create a ${template.style} design: ${template.desc}`);
                  setSelectedStyle(template.style);
                  setActiveTab("generate");
                  toast.info(`Template "${template.name}" loaded`);
                }}>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Type className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold">{template.name}</h4>
                      <p className="text-xs text-muted-foreground capitalize">{template.style}</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{template.desc}</p>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
