import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Subject {
  id: string;
  name: string;
  color: string;
}

interface SubjectManagerProps {
  userId: string;
  onSelectSubject: (subject: Subject | null) => void;
  selectedSubject: Subject | null;
}

const PRESET_COLORS = [
  "#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899", "#06B6D4", "#F97316"
];

const SubjectManager = ({ userId, onSelectSubject, selectedSubject }: SubjectManagerProps) => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [newSubjectName, setNewSubjectName] = useState("");
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0]);
  const { toast } = useToast();

  useEffect(() => {
    fetchSubjects();
  }, [userId]);

  const fetchSubjects = async () => {
    const { data, error } = await supabase
      .from("subjects")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Error loading subjects",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    setSubjects(data || []);
  };

  const addSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubjectName.trim()) return;

    const { error } = await supabase.from("subjects").insert({
      user_id: userId,
      name: newSubjectName.trim(),
      color: selectedColor,
    });

    if (error) {
      toast({
        title: "Error adding subject",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Subject added!",
      description: `${newSubjectName} has been added to your subjects.`,
    });

    setNewSubjectName("");
    fetchSubjects();
  };

  const deleteSubject = async (id: string) => {
    const { error } = await supabase.from("subjects").delete().eq("id", id);

    if (error) {
      toast({
        title: "Error deleting subject",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    if (selectedSubject?.id === id) {
      onSelectSubject(null);
    }

    toast({
      title: "Subject deleted",
      description: "Subject has been removed.",
    });

    fetchSubjects();
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 border-border/50">
        <h3 className="text-lg font-semibold mb-4">Add New Subject</h3>
        <form onSubmit={addSubject} className="space-y-4">
          <Input
            placeholder="Subject name"
            value={newSubjectName}
            onChange={(e) => setNewSubjectName(e.target.value)}
            className="border-border/50"
          />
          <div className="flex gap-2 flex-wrap">
            {PRESET_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setSelectedColor(color)}
                className={`w-10 h-10 rounded-lg border-2 transition-all ${
                  selectedColor === color ? "border-foreground scale-110" : "border-transparent"
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
          <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
            <Plus className="mr-2 h-4 w-4" />
            Add Subject
          </Button>
        </form>
      </Card>

      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Your Subjects</h3>
        {subjects.length === 0 ? (
          <Card className="p-6 text-center text-muted-foreground border-dashed">
            No subjects yet. Add your first subject above!
          </Card>
        ) : (
          <div className="grid gap-3">
            {subjects.map((subject) => (
              <Card
                key={subject.id}
                className={`p-4 flex items-center justify-between cursor-pointer transition-all border-border/50 hover:shadow-md ${
                  selectedSubject?.id === subject.id ? "ring-2 ring-primary shadow-lg" : ""
                }`}
                onClick={() => onSelectSubject(subject)}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: subject.color }}
                  />
                  <span className="font-medium">{subject.name}</span>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteSubject(subject.id);
                  }}
                  className="hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SubjectManager;
