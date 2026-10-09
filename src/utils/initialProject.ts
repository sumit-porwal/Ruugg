import type { ProjectState, Slide } from '../types';
import { createModelElement, createStickyNote } from './sixSlicesTemplates';

export function getInitialProject(): ProjectState {
  const slide1: Slide = {
    id: 'slide_intro',
    title: 'Visual Thinking & The 6 Slices',
    sliceTag: 'whoWhat',
    questionPrompt: 'How can visual thinking clarify complex ideas?',
    notes: 'Welcome to NapkinCanvas! Inspired by Dan Roam\'s Napkin Academy. Use simple drawings to solve problems and pitch ideas.',
    paperTexture: 'napkin',
    elements: [
      {
        id: 'title_1',
        type: 'text',
        x: 60,
        y: 60,
        text: 'The Back of the Napkin: 6 Ways of Seeing',
        fontSize: 32,
        color: '#1e293b',
        fontFamily: 'Kalam',
      },
      {
        id: 'subtitle_1',
        type: 'text',
        x: 60,
        y: 110,
        text: 'Any complex problem can be clarified using one of the 6 Slices:',
        fontSize: 18,
        color: '#64748b',
        fontFamily: 'Patrick Hand',
      },
      createStickyNote(60, 160, '1. WHO & WHAT:\nPeople, roles & objects', '1. WHO & WHAT', '#e0e7ff', '#4f46e5'),
      createStickyNote(280, 160, '2. HOW MUCH:\nQuantities & charts', '2. HOW MUCH', '#d1fae5', '#059669'),
      createStickyNote(500, 160, '3. WHERE:\n2x2 Matrix & Venn maps', '3. WHERE', '#e0f2fe', '#0284c7'),
      createStickyNote(60, 360, '4. WHEN:\nTimelines & roadmaps', '4. WHEN', '#fef3c7', '#d97706'),
      createStickyNote(280, 360, '5. HOW:\nFlowcharts & steps', '5. HOW (STEPS)', '#cffafe', '#0891b2'),
      createStickyNote(500, 360, '6. WHY:\nTrade-offs & vision', '6. WHY', '#ffe4e6', '#e11d48'),
      {
        id: 'shape_arrow_intro',
        type: 'shape',
        shapeType: 'arrow',
        x: 720,
        y: 220,
        width: 140,
        height: 60,
        color: '#2563eb',
        strokeWidth: 3,
        isRough: true,
      },
      {
        id: 'text_coach_cue',
        type: 'text',
        x: 720,
        y: 300,
        text: 'Draw freely with the\nSmart Assistant & Tools!',
        fontSize: 16,
        color: '#2563eb',
        fontFamily: 'Patrick Hand',
      },
    ],
  };

  const slide2: Slide = {
    id: 'slide_who',
    title: '1. Who & What: The Stakeholders',
    sliceTag: 'whoWhat',
    questionPrompt: 'Who are the players and what are the pieces?',
    notes: 'Always identify who is experiencing the problem before proposing solutions.',
    paperTexture: 'napkin',
    elements: [
      {
        id: 'title_2',
        type: 'text',
        x: 60,
        y: 50,
        text: 'Slice 1: Who & What — Key Players',
        fontSize: 28,
        color: '#1e293b',
        fontFamily: 'Kalam',
      },
      createModelElement('stickmanScene', 'whoWhat', 60, 120, '#1e293b'),
      createStickyNote(600, 120, 'Insight: Aligning our team directly with user pain points creates faster adoption.'),
      {
        id: 'stamp_light',
        type: 'stamp',
        stampIcon: 'lightbulb',
        x: 660,
        y: 330,
        size: 64,
        color: '#d97706',
        label: 'Aha! Moment',
      },
    ],
  };

  const slide3: Slide = {
    id: 'slide_howmuch',
    title: '2. How Much: Growth & Slices',
    sliceTag: 'howMuch',
    questionPrompt: 'How much is there? What are the metrics?',
    notes: 'Numbers speak louder when visualized with clear bar heights and percentages.',
    paperTexture: 'napkin',
    elements: [
      {
        id: 'title_3',
        type: 'text',
        x: 60,
        y: 40,
        text: 'Slice 2: How Much — Native Charts',
        fontSize: 28,
        color: '#1e293b',
        fontFamily: 'Kalam',
      },
      createModelElement('barchart', 'howMuch', 60, 100, '#1e293b'),
      createModelElement('piechart', 'howMuch', 570, 100, '#1e293b'),
    ],
  };

  const slide4: Slide = {
    id: 'slide_where',
    title: '3. Where: Strategic 2x2 Matrix',
    sliceTag: 'where',
    questionPrompt: 'Where do things stand in relation to each other?',
    notes: 'The 2x2 matrix is the quintessential napkin tool for rapid prioritization.',
    paperTexture: 'kraft',
    elements: [
      {
        id: 'title_4',
        type: 'text',
        x: 60,
        y: 40,
        text: 'Slice 3: Where — Effort vs. Impact Matrix',
        fontSize: 28,
        color: '#1e293b',
        fontFamily: 'Kalam',
      },
      createModelElement('matrix2x2', 'where', 60, 100, '#1e293b'),
      createStickyNote(610, 120, 'Focus only on Quick Wins for Sprint 1!\nDeprioritize Time Sinks immediately.'),
      {
        id: 'star_action',
        type: 'shape',
        shapeType: 'star',
        x: 660,
        y: 320,
        width: 70,
        height: 70,
        color: '#16a34a',
        fillColor: 'rgba(34, 197, 94, 0.2)',
        strokeWidth: 2.5,
        isRough: true,
      },
    ],
  };

  const slide5: Slide = {
    id: 'slide_when',
    title: '4. When: Milestone Roadmap',
    sliceTag: 'when',
    questionPrompt: 'When do things happen? In what sequence?',
    notes: 'A clear linear progression prevents anxiety and aligns expectations.',
    paperTexture: 'grid',
    elements: [
      {
        id: 'title_5',
        type: 'text',
        x: 60,
        y: 50,
        text: 'Slice 4: When — Phased Execution',
        fontSize: 28,
        color: '#1e293b',
        fontFamily: 'Kalam',
      },
      createModelElement('timeline', 'when', 60, 130, '#1e293b'),
      createStickyNote(700, 130, 'Key Milestone:\nBeta Testing in Month 4'),
    ],
  };

  const slide6: Slide = {
    id: 'slide_how',
    title: '5. How: Process & Flow',
    sliceTag: 'how',
    questionPrompt: 'How does it work? What is the pipeline?',
    notes: 'Flowcharts show the machinery behind the vision.',
    paperTexture: 'napkin',
    elements: [
      {
        id: 'title_6',
        type: 'text',
        x: 60,
        y: 50,
        text: 'Slice 5: How — The Logic Pipeline',
        fontSize: 28,
        color: '#1e293b',
        fontFamily: 'Kalam',
      },
      createModelElement('flowchart', 'how', 60, 130, '#1e293b'),
      createStickyNote(700, 140, 'Napkin sketches make validation 5x faster than code meetings!'),
    ],
  };

  const slide7: Slide = {
    id: 'slide_why',
    title: '6. Why: Trade-off & Vision',
    sliceTag: 'why',
    questionPrompt: 'Why does this matter? What is the payoff?',
    notes: 'Summarize the decision with a clear trade-off balance.',
    paperTexture: 'napkin',
    elements: [
      {
        id: 'title_7',
        type: 'text',
        x: 60,
        y: 50,
        text: 'Slice 6: Why — Weighing the Balance',
        fontSize: 28,
        color: '#1e293b',
        fontFamily: 'Kalam',
      },
      createModelElement('balance', 'why', 60, 130, '#1e293b'),
      createModelElement('scurve', 'why', 560, 130, '#1e293b'),
    ],
  };

  return {
    title: 'Napkin Academy — Visual Problem Solving',
    slides: [slide1, slide2, slide3, slide4, slide5, slide6, slide7],
    activeSlideId: 'slide_intro',
  };
}
