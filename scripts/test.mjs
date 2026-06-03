import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

initializeApp({ projectId: 'med-peptides-app' });
const db = getFirestore();

async function run() {
  try {
    const newBlog = {
      title: 'The Future of Peptide Therapy in 2026',
      slug: 'future-of-peptide-therapy-2026',
      author: 'Atlas Health AI',
      content: '<h1>The Future of Peptide Therapy</h1><p><strong>Did you know?</strong> Peptide therapy is revolutionizing regenerative medicine...</p>',
      summary: 'Explore how new advancements in peptide therapy are changing the landscape of anti-aging and regenerative medicine.',
      tags: ['Peptides', 'Longevity', 'News'],
      status: 'published',
      views: 0,
      linkedInShared: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const docRef = await db.collection('blogPosts').add(newBlog);
    console.log('Successfully created automated blog post:', docRef.id);
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}
run();
