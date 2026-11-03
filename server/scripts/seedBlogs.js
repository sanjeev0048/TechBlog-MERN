import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import User from '../models/User.js';
import Category from '../models/Category.js';
import Tag from '../models/Tag.js';
import Blog from '../models/Blog.js';
import { slugify } from '../utils/slugify.js';
import { seedAdmin } from './seedAdmin.js';
import { seedCategories } from './seedCategories.js';

dotenv.config();

const SAMPLE_ARTICLES = [
  {
    title: "Building Resilient Microservices Architecture in 2026",
    slug: "building-resilient-microservices-architecture-2026",
    categoryName: "Software Development",
    tags: ["Microservices", "Architecture", "Backend", "DevOps"],
    excerpt: "Explore key architectural patterns, service meshes, and failover strategies for building fault-tolerant backend microservices systems at enterprise scale.",
    content: `## Introduction to Microservices Resilience

As enterprise systems grow in scale and distributed complexity, modern software architecture demands high availability, fault tolerance, and seamless auto-scaling. Distributed systems inevitably fail—it is not a question of *if*, but *when*.

### Key Design Patterns

- **Circuit Breaker Pattern**: Prevent cascading failures across services by short-circuiting calls to unhealthy downstream dependencies.
- **Bulkhead Isolation**: Isolate critical system resources so a failure in one non-essential module does not bring down the entire application stack.
- **Retry Strategy with Exponential Backoff**: Mitigate transient network glitches gracefully without overwhelming failing downstream servers.

\`\`\`javascript
// Example Circuit Breaker configuration pattern
const circuitBreaker = new CircuitBreaker(asyncServiceCall, {
  timeout: 3000,
  errorThresholdPercentage: 50,
  resetTimeout: 10000
});

circuitBreaker.fallback(() => ({ status: 'degraded', data: [] }));
\`\`\`

### Observability & Incident Response

Distributed tracing, centralized metrics logging, and synthetic health checks form the foundational triad of maintaining reliable microservices under high traffic loads.

### Summary
Building resilient microservices requires proactive planning, robust observability frameworks, and continuous stress testing across modern cloud environments.`,
    isFeatured: true,
    status: "published",
    views: 4520,
    featuredImage: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80",
    seoTitle: "Building Resilient Microservices Architecture (2026 Guide)",
    metaDescription: "Learn essential architectural patterns, circuit breakers, and resiliency strategies for enterprise backend microservices."
  },
  {
    title: "Navigating LLM Orchestration & Autonomous AI Agents",
    slug: "navigating-llm-orchestration-autonomous-ai-agents",
    categoryName: "AI & ML",
    tags: ["LLM", "Agents", "Generative AI", "Automation"],
    excerpt: "How modern enterprises are leveraging agentic frameworks to automate complex multi-step technical workflows with real-time feedback loops.",
    content: `## The Shift Toward Agentic Workflows

Generative AI models have evolved rapidly from simple query-response pairs into autonomous agents capable of dynamic reasoning, tool invocation, and automated task execution.

### Multi-Agent Collaboration Architectures

By partitioning complex engineering tasks between specialized, domain-focused agents, system outputs achieve significantly higher accuracy and verification.

- **Planner Agent**: Deconstructs high-level objectives into granular execution graphs.
- **Executor Agent**: Interfaces directly with internal APIs, databases, and third-party web services.
- **Reviewer Agent**: Validates execution outputs against compliance policies and code linting standards.

### Real-world Enterprise Impact

Organizations integrating agentic orchestration report up to 40% reductions in routine operational triaging and automated bug resolution workflows.`,
    isFeatured: false,
    status: "published",
    views: 3890,
    featuredImage: "https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&w=1200&q=80",
    seoTitle: "Enterprise LLM Orchestration & Autonomous Agents",
    metaDescription: "Discover how agentic frameworks automate complex developer workflows and improve multi-step AI reasoning."
  },
  {
    title: "Advanced React 19 Patterns: Server Actions, Transitions, and Optimistic UI",
    slug: "advanced-react-19-patterns-server-actions-transitions",
    categoryName: "Web and Mobile App Development",
    tags: ["React", "Frontend", "JavaScript", "Performance"],
    excerpt: "Master modern React paradigms including concurrent transitions, asynchronous form actions, and zero-latency optimistic interface mutations.",
    content: `## Modernizing the React Component Lifecycle

React 19 formalizes patterns that eliminate manual pending-state flags, complex redux thunks, and fragile state synchronization hooks.

### Using useTransition and Optimistic Updates

By wrapping async mutators inside \`useTransition\`, React guarantees that high-priority user keystrokes never stutter while heavy network roundtrips resolve in the background.

\`\`\`jsx
function CommentThread({ comments, onAddComment }) {
  const [optimisticList, setOptimisticList] = useOptimistic(
    comments,
    (state, newText) => [...state, { text: newText, sending: true }]
  );
}
\`\`\`

### Key Architectural Takeaways

Transition-aware user interfaces feel noticeably more tactile and responsive across high-latency mobile devices.`,
    isFeatured: false,
    status: "published",
    views: 3120,
    featuredImage: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=1200&q=80",
    seoTitle: "Advanced React 19 Patterns & Optimistic UI",
    metaDescription: "Deep dive into React 19 concurrent features, transitions, and optimistic user interface patterns."
  },
  {
    title: "Zero Trust Security Blueprint for Modern Cloud Infrastructure",
    slug: "zero-trust-security-blueprint-cloud-infrastructure",
    categoryName: "Cybersecurity",
    tags: ["Zero Trust", "Security", "Cloud", "Identity"],
    excerpt: "Never trust, always verify: Implementing identity-centric perimeters, micro-segmentation, and continuous compliance across multi-cloud environments.",
    content: `## Core Pillars of Zero Trust Architecture

Traditional perimeter security models are fundamentally inadequate for modern hybrid and multi-cloud environments. Zero Trust operates under the core assumption of breach, mandating strict identity verification at every network layer.

### Key Operational Principles

- **Explicit Verification**: Authenticate and authorize every request based on device posture, user identity, and contextual attributes.
- **Least Privilege Access**: Restrict user rights dynamically with Just-In-Time (JIT) access policies.
- **Assume Breach Mindset**: Minimize blast radiuses by implementing strict micro-segmentation and end-to-end payload encryption.

### Implementation Roadmaps

Adopting Zero Trust requires aligning identity providers (IdP), runtime workload security, and centralized telemetry monitoring.`,
    isFeatured: false,
    status: "published",
    views: 6120,
    featuredImage: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1200&q=80",
    seoTitle: "Zero Trust Security Architecture for Cloud Infrastructure",
    metaDescription: "Step-by-step security guide for implementing identity perimeters, micro-segmentation, and zero trust policies."
  },
  {
    title: "FinOps Strategy: Optimizing Multi-Cloud Spend at Scale",
    slug: "finops-strategy-optimizing-multi-cloud-spend",
    categoryName: "Cloud Computing",
    tags: ["FinOps", "AWS", "Azure", "Cloud Cost"],
    excerpt: "Practical frameworks to align engineering accountability with financial discipline across AWS, Microsoft Azure, and Google Cloud Platform.",
    content: `## Bridging Engineering Autonomy with Financial Governance

Unchecked cloud provisioning frequently results in unsustainable operational overheads. FinOps establishes financial visibility, budget alerts, and resource optimization frameworks.

### Implementing Unit Economics

Tracking compute cost per active user or per transaction allows engineering managers to make informed architectural trade-offs between reserved instances and serverless functions.`,
    isFeatured: false,
    status: "published",
    views: 1840,
    featuredImage: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80",
    seoTitle: "Multi-Cloud FinOps Strategy and Governance",
    metaDescription: "Frameworks for engineering leaders to monitor, allocate, and optimize enterprise cloud spending across platforms."
  },
  {
    title: "WebAssembly in 2026: Pushing Web Performance to Native Speed",
    slug: "webassembly-2026-web-performance-native-speed",
    categoryName: "Technology & Innovation",
    tags: ["WebAssembly", "Performance", "Rust", "Web"],
    excerpt: "How WASM modules enable desktop-grade video editing, 3D CAD rendering, and real-time audio processing directly in browser engines.",
    content: `## WebAssembly Beyond Browser Boundaries

WebAssembly (WASM) continues to break performance boundaries beyond browser runtimes into serverless functions and edge computing platforms.

### Performance Benchmarks

By bypassing traditional JavaScript garbage collection cycles, compiled Rust and C++ WASM binaries deliver consistent near-native compute execution speeds directly inside client viewports.`,
    isFeatured: false,
    status: "published",
    views: 2100,
    featuredImage: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=1200&q=80",
    seoTitle: "WebAssembly in 2026: High-Performance Web Applications",
    metaDescription: "Explore how WASM modules bring native execution speed and client-side computational power to web applications."
  },
  {
    title: "Enterprise AI Ethics and Governance Frameworks",
    slug: "enterprise-ai-ethics-and-governance-frameworks",
    categoryName: "Industry Insights",
    tags: ["AI Ethics", "Governance", "Compliance"],
    excerpt: "Drafting robust internal guidelines to ensure data privacy, algorithmic transparency, and bias reduction in commercial ML deployments.",
    content: `## Responsible AI Implementation

As artificial intelligence systems make autonomous decisions impacting consumers, enterprise governance frameworks are vital to mitigate operational risk.

### Audit Trails and Transparency

Every automated decision pipeline should maintain deterministic audit logs, enabling human oversight and regulatory compliance validation.`,
    isFeatured: false,
    status: "draft",
    views: 120,
    featuredImage: "https://images.unsplash.com/photo-1507146426996-ef05306b995a?auto=format&fit=crop&w=1200&q=80",
    seoTitle: "Enterprise AI Ethics & Governance Playbook",
    metaDescription: "Best practices for deploying compliant, transparent, and fair machine learning models in enterprise environments."
  }
];

export async function seedBlogs() {
  console.log('Seeding sample blog articles...');

  const admin = await User.findOne({ role: 'admin' });
  if (!admin) {
    throw new Error('Admin user required before seeding blogs. Run seedAdmin first.');
  }

  for (const item of SAMPLE_ARTICLES) {
    // Resolve Category
    const categoryDoc = await Category.findOne({ name: item.categoryName });
    if (!categoryDoc) {
      console.warn(`Category "${item.categoryName}" not found. Skipping "${item.title}".`);
      continue;
    }

    // Resolve Tags
    const tagIds = [];
    for (const tagName of item.tags) {
      const tagSlug = slugify(tagName);
      let tagDoc = await Tag.findOne({ slug: tagSlug });
      if (!tagDoc) {
        tagDoc = await Tag.create({ name: tagName, slug: tagSlug });
      }
      tagIds.push(tagDoc._id);
    }

    const blogData = {
      title: item.title,
      slug: item.slug,
      excerpt: item.excerpt,
      content: item.content,
      featuredImage: item.featuredImage,
      author: admin._id,
      category: categoryDoc._id,
      tags: tagIds,
      status: item.status,
      isFeatured: item.isFeatured,
      publishedAt: item.status === 'published' ? new Date() : null,
      views: item.views,
      seoTitle: item.seoTitle,
      metaDescription: item.metaDescription
    };

    let blog = await Blog.findOne({ slug: item.slug });
    if (!blog) {
      blog = await Blog.create(blogData);
      console.log(` Created article: "${item.title}"`);
    } else {
      Object.assign(blog, blogData);
      await blog.save();
      console.log(` Updated existing article: "${item.title}"`);
    }
  }

  console.log('Blog article seeding complete.');
}

if (process.argv[1]?.endsWith('seedBlogs.js')) {
  (async () => {
    try {
      await connectDB();
      await seedAdmin();
      await seedCategories();
      await seedBlogs();
      console.log('All sample blogs seeded successfully.');
      process.exit(0);
    } catch (err) {
      console.error('Blog seeding failed:', err);
      process.exit(1);
    }
  })();
}
