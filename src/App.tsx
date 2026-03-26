import { useState } from 'react';
import { Reel } from './types';
import { Header } from './components/Header';
import { TagFilter } from './components/TagFilter';
import { ReelGrid } from './components/ReelGrid';
import { AddReelModal } from './components/AddReelModal';
import { EditTagsModal } from './components/EditTagsModal';

export default function App() {
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editingReel, setEditingReel] = useState<Reel | null>(null);

  return (
    <div className="min-h-screen bg-slate-50">
      <Header onAddReel={() => setAddModalOpen(true)} />

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-5">
        <TagFilter />
        <ReelGrid onEditTags={setEditingReel} />
      </main>

      {addModalOpen && <AddReelModal onClose={() => setAddModalOpen(false)} />}
      {editingReel && (
        <EditTagsModal reel={editingReel} onClose={() => setEditingReel(null)} />
      )}
    </div>
  );
}
