-- Insert sample quizzes and questions

-- Get subject IDs for reference
-- Insert sample quizzes
INSERT INTO public.quizzes (subject_id, title, description, class_level, difficulty_level) 
SELECT id, 'Basic Science Quiz', 'Test your knowledge of fundamental science concepts', '6', 'easy' 
FROM public.subjects WHERE name = 'Science';

INSERT INTO public.quizzes (subject_id, title, description, class_level, difficulty_level) 
SELECT id, 'Mathematics Fundamentals', 'Explore basic mathematical operations and concepts', '6', 'easy' 
FROM public.subjects WHERE name = 'Mathematics';

INSERT INTO public.quizzes (subject_id, title, description, class_level, difficulty_level) 
SELECT id, 'Technology Basics', 'Learn about computers and digital technology', '6', 'easy' 
FROM public.subjects WHERE name = 'Technology';

INSERT INTO public.quizzes (subject_id, title, description, class_level, difficulty_level) 
SELECT id, 'Engineering Concepts', 'Introduction to problem solving and design thinking', '6', 'easy' 
FROM public.subjects WHERE name = 'Engineering';

-- Insert sample questions for Science quiz
INSERT INTO public.questions (quiz_id, question_text, options, correct_answer, explanation, points, order_index) 
SELECT q.id, 'What is the smallest unit of matter?', 
'["Atom", "Molecule", "Cell", "Proton"]'::jsonb, 
'Atom', 
'An atom is the smallest unit of matter that retains the properties of an element.',
1, 1
FROM public.quizzes q 
JOIN public.subjects s ON q.subject_id = s.id 
WHERE s.name = 'Science' AND q.title = 'Basic Science Quiz';

INSERT INTO public.questions (quiz_id, question_text, options, correct_answer, explanation, points, order_index) 
SELECT q.id, 'Which planet is known as the Red Planet?', 
'["Venus", "Mars", "Jupiter", "Saturn"]'::jsonb, 
'Mars', 
'Mars appears red due to iron oxide (rust) on its surface.',
1, 2
FROM public.quizzes q 
JOIN public.subjects s ON q.subject_id = s.id 
WHERE s.name = 'Science' AND q.title = 'Basic Science Quiz';

INSERT INTO public.questions (quiz_id, question_text, options, correct_answer, explanation, points, order_index) 
SELECT q.id, 'What do plants need to make their own food?', 
'["Water only", "Sunlight only", "Sunlight, water, and carbon dioxide", "Air only"]'::jsonb, 
'Sunlight, water, and carbon dioxide', 
'Photosynthesis requires sunlight, water, and carbon dioxide to produce glucose.',
1, 3
FROM public.quizzes q 
JOIN public.subjects s ON q.subject_id = s.id 
WHERE s.name = 'Science' AND q.title = 'Basic Science Quiz';

-- Insert sample questions for Mathematics quiz
INSERT INTO public.questions (quiz_id, question_text, options, correct_answer, explanation, points, order_index) 
SELECT q.id, 'What is 15 × 8?', 
'["120", "130", "110", "140"]'::jsonb, 
'120', 
'15 × 8 = 120. You can break it down as 15 × 10 - 15 × 2 = 150 - 30 = 120.',
1, 1
FROM public.quizzes q 
JOIN public.subjects s ON q.subject_id = s.id 
WHERE s.name = 'Mathematics' AND q.title = 'Mathematics Fundamentals';

INSERT INTO public.questions (quiz_id, question_text, options, correct_answer, explanation, points, order_index) 
SELECT q.id, 'What is the area of a rectangle with length 6 cm and width 4 cm?', 
'["24 cm²", "20 cm²", "10 cm²", "14 cm²"]'::jsonb, 
'24 cm²', 
'Area of rectangle = length × width = 6 × 4 = 24 cm².',
1, 2
FROM public.quizzes q 
JOIN public.subjects s ON q.subject_id = s.id 
WHERE s.name = 'Mathematics' AND q.title = 'Mathematics Fundamentals';

INSERT INTO public.questions (quiz_id, question_text, options, correct_answer, explanation, points, order_index) 
SELECT q.id, 'If you have 100 apples and give away 35, how many do you have left?', 
'["75", "65", "55", "45"]'::jsonb, 
'65', 
'100 - 35 = 65 apples remaining.',
1, 3
FROM public.quizzes q 
JOIN public.subjects s ON q.subject_id = s.id 
WHERE s.name = 'Mathematics' AND q.title = 'Mathematics Fundamentals';

-- Insert sample games
INSERT INTO public.games (name, description, subject_id, game_type, difficulty_level, class_level, game_data) 
SELECT 'Memory Match Science', 'Match science terms with their definitions', id, 'memory', 'easy', '6',
'{"cards": [{"term": "Photosynthesis", "definition": "Process plants use to make food"}, {"term": "Gravity", "definition": "Force that pulls objects down"}]}'::jsonb
FROM public.subjects WHERE name = 'Science';

INSERT INTO public.games (name, description, subject_id, game_type, difficulty_level, class_level, game_data) 
SELECT 'Math Puzzle Challenge', 'Solve mathematical puzzles and problems', id, 'puzzle', 'easy', '6',
'{"puzzles": [{"question": "What number comes next: 2, 4, 6, 8, ?", "answer": "10"}]}'::jsonb
FROM public.subjects WHERE name = 'Mathematics';

INSERT INTO public.games (name, description, subject_id, game_type, difficulty_level, class_level, game_data) 
SELECT 'Word Builder Tech', 'Build technology-related words', id, 'word', 'easy', '6',
'{"words": ["COMPUTER", "INTERNET", "SOFTWARE", "HARDWARE"]}'::jsonb
FROM public.subjects WHERE name = 'Technology';

-- Insert sample reading materials
INSERT INTO public.reading_materials (title, content, subject_id, class_level, material_type, difficulty_level, estimated_time) 
SELECT 'The Water Cycle Adventure', 
'Join Droppy the water drop on an amazing journey! Droppy starts in the ocean, then the sun heats him up and he evaporates into the sky. In the clouds, he meets other water drops and they form bigger clouds. When the cloud gets too heavy, Droppy falls as rain! He lands in a river, flows back to the ocean, and the cycle starts again. This is how water moves around our Earth every day!

The water cycle has three main steps:
1. Evaporation: Water turns into vapor and rises
2. Condensation: Water vapor forms clouds
3. Precipitation: Water falls as rain or snow

Fun Fact: The same water that dinosaurs drank millions of years ago is still here today, just moving around in the water cycle!',
id, '6', 'story', 'easy', 5
FROM public.subjects WHERE name = 'Science';

INSERT INTO public.reading_materials (title, content, subject_id, class_level, material_type, difficulty_level, estimated_time) 
SELECT 'The Magic of Numbers', 
'Numbers are everywhere around us! They help us count, measure, and solve problems. Did you know that mathematics is like a universal language that everyone in the world can understand?

Let''s explore some fun number facts:
- Zero was invented in India around 1,500 years ago
- The number π (pi) goes on forever without repeating
- Fibonacci numbers appear in nature, like in sunflower seeds and pinecones

When you solve a math problem, you''re like a detective finding clues and putting them together. Each step in solving brings you closer to the answer. Practice makes you better at recognizing patterns and finding solutions quickly!

Try this: Look around your room and count all the things that come in pairs. Mathematics is everywhere!',
id, '6', 'article', 'easy', 4
FROM public.subjects WHERE name = 'Mathematics';

INSERT INTO public.reading_materials (title, content, subject_id, class_level, material_type, difficulty_level, estimated_time) 
SELECT 'How Computers Think', 
'Have you ever wondered how computers work? Computers are amazing machines that can only understand two things: ON and OFF, which we call 1 and 0. This is called binary code!

Everything you see on a computer screen - pictures, videos, games, and text - is all made from combinations of 1s and 0s. It''s like a secret code that computers use to communicate.

Computers have several important parts:
- CPU (Central Processing Unit): The brain that processes information
- Memory (RAM): Where the computer stores information it''s currently using
- Storage: Where files and programs are saved permanently
- Input devices: Like keyboard and mouse to give commands
- Output devices: Like screen and speakers to show results

The most amazing thing? Computers can do billions of calculations per second! That''s why they can show smooth videos and run complex games.',
id, '6', 'lesson', 'easy', 6
FROM public.subjects WHERE name = 'Technology';