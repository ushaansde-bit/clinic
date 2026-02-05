/* ============================================
   BLOG AUTO-UPDATE SYSTEM
   Shree Physiotherapy Clinic
   Auto-updates trending articles daily
   ============================================ */

(function() {
    'use strict';

    // Physiotherapy images for each category - professional medical and rehabilitation images
    // High-quality images matching article content for better SEO and user engagement
    const VECTOR_IMAGES = {
        // Back Pain - spine treatment, physiotherapy, rehabilitation
        backPain: [
            "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80", // Medical professional
            "https://images.unsplash.com/photo-1559757175-5700dde675bc?w=800&q=80", // Back massage therapy
            "https://images.unsplash.com/photo-1573497620053-ea5300f94f21?w=800&q=80"  // Stretching exercise
        ],
        // Neck Pain - cervical treatment, massage therapy
        neckPain: [
            "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&q=80", // Neck massage
            "https://images.unsplash.com/photo-1559757175-5700dde675bc?w=800&q=80", // Therapy session
            "https://images.unsplash.com/photo-1552196563-55cd4e45efb3?w=800&q=80"  // Stretching
        ],
        // Knee Pain - leg exercises, knee rehabilitation
        kneePain: [
            "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80", // Exercise stretching
            "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80", // Gym equipment
            "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80"  // Weight training
        ],
        // Shoulder Pain - shoulder exercises, upper body workout
        shoulderPain: [
            "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80", // Shoulder stretch
            "https://images.unsplash.com/photo-1550345332-09e3ac987658?w=800&q=80", // Dumbbell exercise
            "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80"  // Gym equipment
        ],
        // Women's Health - women fitness, prenatal, postnatal care
        womensHealth: [
            "https://images.unsplash.com/photo-1518310383802-640c2de311b2?w=800&q=80", // Women yoga
            "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80", // Women exercise
            "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&q=80"  // Fitness class
        ],
        // Elderly Care - senior exercise, home physiotherapy
        elderlyPhysio: [
            "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&q=80", // Medical care
            "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&q=80", // Healthcare
            "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80"  // Professional care
        ],
        // Exercise & Sports - gym, fitness, sports rehabilitation
        exercise: [
            "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80", // Gym interior
            "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80", // Weight training
            "https://images.unsplash.com/photo-1549060279-7e168fcee0c2?w=800&q=80"  // Running
        ],
        // Posture & Ergonomics - office exercises, posture correction
        posture: [
            "https://images.unsplash.com/photo-1552196563-55cd4e45efb3?w=800&q=80", // Stretching
            "https://images.unsplash.com/photo-1573497620053-ea5300f94f21?w=800&q=80", // Office posture
            "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80"  // Exercise mat
        ],
        // Default/Main - local vector image
        main: "vector/physio-main.avif"
    };

    // Get today's date seed for consistent daily rotation
    function getDaySeed() {
        const now = new Date();
        return now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate();
    }

    // Seeded random number generator for consistent daily picks
    function seededRandom(seed) {
        var x = Math.sin(seed++) * 10000;
        return x - Math.floor(x);
    }

    // Get vector image based on category with daily rotation
    // Returns different images for different article categories
    function getCategoryImage(category) {
        const seed = getDaySeed();
        let categoryKey;

        switch(category.toLowerCase()) {
            case 'back pain':
                categoryKey = 'backPain';
                break;
            case 'neck pain':
                categoryKey = 'neckPain';
                break;
            case 'knee pain':
                categoryKey = 'kneePain';
                break;
            case 'shoulder pain':
            case 'frozen shoulder':
                categoryKey = 'shoulderPain';
                break;
            case "women's health":
                categoryKey = 'womensHealth';
                break;
            case 'elderly care':
                categoryKey = 'elderlyPhysio';
                break;
            case 'exercise':
            case 'sports':
                categoryKey = 'exercise';
                break;
            case 'posture':
            case 'ergonomics':
                categoryKey = 'posture';
                break;
            default:
                categoryKey = 'backPain';
        }

        const images = VECTOR_IMAGES[categoryKey];

        // Select image based on daily seed - rotates through available images daily
        const index = Math.floor(seededRandom(seed + category.length) * images.length);

        // Return the category-specific vector image with cache buster
        const imageUrl = images[index];
        const cacheBuster = `&v=${seed}`;
        return imageUrl + cacheBuster;
    }

    // Trending physiotherapy articles database with full content - rotates daily
    const TRENDING_ARTICLES = [
        // Back Pain Articles
        {
            title: "5 Stretches to Relieve Lower Back Pain at Your Desk",
            category: "Back Pain",
            icon: "fas fa-user-injured",
            summary: "Simple stretches you can do at work to prevent and relieve lower back pain caused by prolonged sitting.",
            readTime: "4 min",
            trending: true,
            image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80",
            fullContent: `
                <h2>Why Desk Work Causes Lower Back Pain</h2>
                <p>Prolonged sitting at a desk is one of the leading causes of lower back pain in working professionals. When you sit for extended periods, your hip flexors tighten, your core muscles weaken, and your spine loses its natural curve. This creates pressure on your lumbar discs and can lead to chronic back pain, sciatica, and disc problems.</p>

                <p>At Shree Physiotherapy Clinic in Coimbatore, Dr. Aarthi Ganesh treats hundreds of patients suffering from desk-related back pain every year. The good news is that simple stretches performed throughout your workday can prevent and relieve this discomfort.</p>

                <h2>5 Essential Desk Stretches for Lower Back Pain Relief</h2>

                <h3>1. Seated Spinal Twist</h3>
                <p>Sit upright in your chair with feet flat on the floor. Place your right hand on your left knee and gently twist your torso to the left, looking over your left shoulder. Hold for 20-30 seconds, breathing deeply. Repeat on the other side. This stretch releases tension in the lower back and improves spinal mobility.</p>

                <h3>2. Cat-Cow Stretch (Modified for Chair)</h3>
                <p>Sit on the edge of your chair with hands on your knees. Inhale and arch your back, pushing your chest forward and looking up (cow position). Exhale and round your spine, tucking your chin to chest (cat position). Repeat 10 times. This movement lubricates the spine and relieves stiffness.</p>

                <h3>3. Hip Flexor Stretch</h3>
                <p>Stand beside your chair for support. Step your right foot back into a lunge position, keeping your back straight. Push your hips forward until you feel a stretch in the front of your right hip. Hold for 30 seconds, then switch sides. Tight hip flexors are a major contributor to lower back pain.</p>

                <h3>4. Seated Forward Fold</h3>
                <p>Sit on the edge of your chair with feet hip-width apart. Slowly bend forward from your hips, letting your hands reach toward the floor. Let your head hang relaxed. Hold for 30 seconds while breathing deeply. This stretch releases the entire posterior chain including the lower back.</p>

                <h3>5. Standing Back Extension</h3>
                <p>Stand with feet hip-width apart, hands on your lower back. Gently lean backward, supporting your spine with your hands. Hold for 10 seconds. This counteracts the forward-flexed position of desk work and decompresses the lumbar discs.</p>

                <h2>How Often Should You Stretch?</h2>
                <p>Physiotherapy experts recommend taking a stretch break every 45-60 minutes of desk work. Set a timer on your phone or computer to remind you. Even 2-3 minutes of stretching can significantly reduce back pain and prevent long-term spinal problems.</p>

                <h2>When to Seek Professional Physiotherapy Treatment</h2>
                <p>If your back pain persists despite regular stretching, or if you experience numbness, tingling, or pain radiating down your legs (sciatica), it's time to consult a physiotherapist. At Shree Physiotherapy Clinic, Dr. Aarthi Ganesh uses advanced techniques including Fascial Manipulation to provide lasting relief from chronic back pain.</p>

                <p><strong>Book your appointment today:</strong> Call 9092294466 or visit our clinic in Periyanaickenpalayam, Coimbatore.</p>
            `
        },
        {
            title: "Sciatica vs Lower Back Pain: How to Tell the Difference",
            category: "Back Pain",
            icon: "fas fa-spine",
            summary: "Learn the key differences between sciatica and general lower back pain, and when to seek physiotherapy treatment.",
            readTime: "5 min",
            trending: true,
            image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80",
            fullContent: `
                <h2>Understanding the Difference Between Sciatica and Lower Back Pain</h2>
                <p>Many patients come to Shree Physiotherapy Clinic confused about whether they have sciatica or regular lower back pain. While both conditions affect the lower back region, they have distinct characteristics, causes, and treatment approaches. Understanding these differences is crucial for getting the right treatment.</p>

                <h2>What is Lower Back Pain?</h2>
                <p>Lower back pain, also called lumbar pain, is localized discomfort in the area between your ribs and pelvis. It typically stays in the back region and may feel like a dull ache, stiffness, or sharp pain. Common causes include muscle strain, poor posture, degenerative disc disease, and facet joint problems.</p>

                <h3>Symptoms of Lower Back Pain:</h3>
                <ul>
                    <li>Pain confined to the lower back area</li>
                    <li>Stiffness, especially in the morning</li>
                    <li>Muscle spasms or tightness</li>
                    <li>Pain that worsens with prolonged sitting or standing</li>
                    <li>Relief with position changes or rest</li>
                </ul>

                <h2>What is Sciatica?</h2>
                <p>Sciatica is not just back pain—it's a condition where the sciatic nerve, the longest nerve in your body, becomes compressed or irritated. This nerve runs from your lower back through your buttocks and down each leg. Sciatica causes pain that radiates along this nerve pathway, often affecting only one side of the body.</p>

                <h3>Symptoms of Sciatica:</h3>
                <ul>
                    <li>Pain that shoots from the lower back down the leg</li>
                    <li>Numbness or tingling in the leg or foot</li>
                    <li>Weakness in the affected leg</li>
                    <li>Burning or electric shock-like sensations</li>
                    <li>Pain that worsens when sitting or coughing</li>
                    <li>Difficulty moving the leg or foot</li>
                </ul>

                <h2>Key Differences: How to Identify Your Condition</h2>

                <h3>Location of Pain</h3>
                <p><strong>Lower Back Pain:</strong> Stays in the lumbar region, doesn't travel beyond the buttocks.</p>
                <p><strong>Sciatica:</strong> Radiates from the lower back through the buttock and down the leg, sometimes reaching the foot.</p>

                <h3>Type of Sensation</h3>
                <p><strong>Lower Back Pain:</strong> Dull, aching, or sharp pain without nerve symptoms.</p>
                <p><strong>Sciatica:</strong> Burning, shooting pain with numbness, tingling, or weakness in the leg.</p>

                <h3>Affected Area</h3>
                <p><strong>Lower Back Pain:</strong> Usually affects both sides of the back.</p>
                <p><strong>Sciatica:</strong> Typically affects only one leg.</p>

                <h2>Physiotherapy Treatment for Both Conditions</h2>
                <p>At Shree Physiotherapy Clinic, Dr. Aarthi Ganesh uses a comprehensive approach to treat both sciatica and lower back pain. Treatment may include Fascial Manipulation, nerve gliding exercises, core strengthening, and posture correction. Most patients experience significant improvement within 4-8 sessions.</p>

                <p>90% of sciatica cases can be successfully treated with physiotherapy, avoiding the need for surgery. Early intervention is key to preventing chronic pain and nerve damage.</p>

                <p><strong>Don't suffer in silence.</strong> Contact Shree Physiotherapy Clinic at 9092294466 for expert diagnosis and treatment of your back pain or sciatica.</p>
            `
        },
        {
            title: "Core Exercises for Preventing Back Pain",
            category: "Back Pain",
            icon: "fas fa-dumbbell",
            summary: "Strengthen your core muscles with these physiotherapist-approved exercises to protect your spine.",
            readTime: "6 min",
            trending: false,
            image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80",
            fullContent: `
                <h2>Why Core Strength is Essential for Back Pain Prevention</h2>
                <p>Your core muscles are like a natural back brace that supports and protects your spine. When these muscles are weak, your lower back takes on excessive stress during daily activities, leading to pain, disc problems, and injuries. At Shree Physiotherapy Clinic, Dr. Aarthi Ganesh emphasizes core strengthening as a fundamental component of back pain treatment and prevention.</p>

                <h2>Understanding Your Core Muscles</h2>
                <p>The core isn't just your "six-pack" abs. It includes the transverse abdominis (deep abdominal muscle), multifidus (spine stabilizers), pelvic floor muscles, diaphragm, and obliques. These muscles work together to provide 360-degree support for your spine.</p>

                <h2>7 Physiotherapist-Approved Core Exercises</h2>

                <h3>1. Dead Bug Exercise</h3>
                <p>Lie on your back with arms extended toward the ceiling and knees bent at 90 degrees. Slowly lower your right arm behind your head while extending your left leg straight. Return and repeat on the opposite side. Perform 10 repetitions per side. This exercise teaches core stability without straining the back.</p>

                <h3>2. Bird Dog</h3>
                <p>Start on hands and knees with a neutral spine. Extend your right arm forward and left leg backward simultaneously, keeping your back flat. Hold for 5 seconds, return to start, and switch sides. Perform 10 repetitions per side. This exercise strengthens the multifidus and improves balance.</p>

                <h3>3. Modified Plank</h3>
                <p>Start in a push-up position on your forearms. Keep your body in a straight line from head to heels, engaging your core muscles. Hold for 20-30 seconds, gradually increasing duration. For beginners, start on your knees. The plank strengthens the entire core without spinal flexion.</p>

                <h3>4. Pelvic Tilts</h3>
                <p>Lie on your back with knees bent and feet flat. Flatten your lower back against the floor by tilting your pelvis upward. Hold for 5 seconds, then release. Repeat 15-20 times. This exercise activates the transverse abdominis and relieves lower back tension.</p>

                <h3>5. Side Plank</h3>
                <p>Lie on your side with your elbow directly under your shoulder. Lift your hips off the ground, creating a straight line from head to feet. Hold for 15-20 seconds per side. This exercise targets the obliques and quadratus lumborum, essential for lateral spine stability.</p>

                <h3>6. Bridge</h3>
                <p>Lie on your back with knees bent and feet hip-width apart. Push through your heels to lift your hips toward the ceiling, squeezing your glutes at the top. Hold for 3 seconds and lower slowly. Perform 15 repetitions. The bridge strengthens the glutes and lower back extensors.</p>

                <h3>7. Abdominal Bracing</h3>
                <p>Practice tightening your core muscles as if preparing for a punch to the stomach, without holding your breath. Maintain this bracing while breathing normally. Practice throughout the day, especially before lifting or bending. This is the foundation of core activation during daily activities.</p>

                <h2>How Often Should You Do Core Exercises?</h2>
                <p>For optimal back pain prevention, perform these exercises 3-4 times per week. Start with lower repetitions and gradually increase as your strength improves. Consistency is more important than intensity.</p>

                <h2>Important Safety Tips</h2>
                <p>Stop immediately if you experience sharp pain. Focus on quality over quantity—proper form prevents injury. Breathe steadily throughout each exercise. If you have existing back problems, consult Dr. Aarthi Ganesh at Shree Physiotherapy Clinic for a personalized exercise prescription.</p>

                <p><strong>Get expert guidance:</strong> Call 9092294466 to schedule a core assessment and personalized exercise program at Shree Physiotherapy Clinic, Coimbatore.</p>
            `
        },
        // Neck Pain Articles
        {
            title: "Tech Neck: The Modern Epidemic and How to Fix It",
            category: "Neck Pain",
            icon: "fas fa-mobile-alt",
            summary: "How smartphone and computer use is causing neck problems and what physiotherapy solutions exist.",
            readTime: "5 min",
            trending: true,
            image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80",
            fullContent: `
                <h2>What is Tech Neck?</h2>
                <p>Tech neck, also known as text neck, is a modern condition caused by the forward head posture we adopt when using smartphones, tablets, and computers. The average person spends 3-5 hours daily looking at their phone, with the head tilted forward at angles up to 60 degrees. This places enormous stress on the cervical spine—up to 60 pounds of pressure compared to the normal 10-12 pounds when the head is aligned.</p>

                <p>At Shree Physiotherapy Clinic in Coimbatore, Dr. Aarthi Ganesh has seen a dramatic increase in tech neck cases, especially among young professionals and students. The good news is that this condition is both preventable and treatable with proper physiotherapy.</p>

                <h2>Symptoms of Tech Neck</h2>
                <ul>
                    <li>Chronic neck pain and stiffness</li>
                    <li>Headaches originating from the base of the skull</li>
                    <li>Pain between the shoulder blades</li>
                    <li>Rounded shoulders and forward head posture</li>
                    <li>Numbness or tingling in the arms and hands</li>
                    <li>Reduced neck mobility</li>
                    <li>Muscle spasms in the neck and upper back</li>
                </ul>

                <h2>The Science Behind Tech Neck</h2>
                <p>When your head moves forward, the muscles at the back of your neck must work harder to hold it up. Over time, these muscles become tight and painful, while the muscles at the front of your neck weaken. This muscular imbalance leads to poor posture, cervical disc problems, and even nerve compression. Additionally, the fascia (connective tissue) becomes restricted, further limiting movement and causing pain.</p>

                <h2>5 Ways to Fix Tech Neck</h2>

                <h3>1. Adjust Your Devices</h3>
                <p>Hold your phone at eye level instead of looking down. Position your computer monitor so the top of the screen is at eye level. Use a document holder beside your screen to avoid looking down at papers.</p>

                <h3>2. Chin Tucks Exercise</h3>
                <p>Sit or stand with good posture. Gently tuck your chin toward your chest, creating a "double chin." Hold for 5 seconds and repeat 10 times, several times daily. This strengthens the deep neck flexors and corrects forward head posture.</p>

                <h3>3. Neck Stretches</h3>
                <p>Gently tilt your head to each side, bringing your ear toward your shoulder. Hold for 20-30 seconds per side. Then slowly turn your head to look over each shoulder. These stretches release tight muscles and improve mobility.</p>

                <h3>4. Shoulder Blade Squeezes</h3>
                <p>Squeeze your shoulder blades together as if trying to hold a pencil between them. Hold for 5 seconds and repeat 15 times. This strengthens the muscles that pull your shoulders back, counteracting the rounded shoulder posture.</p>

                <h3>5. Take Regular Breaks</h3>
                <p>Follow the 20-20-20 rule: every 20 minutes, look at something 20 feet away for 20 seconds. Set reminders to stand up and move every hour. Small breaks prevent cumulative damage to your neck.</p>

                <h2>Professional Physiotherapy Treatment for Tech Neck</h2>
                <p>If self-care measures aren't enough, professional physiotherapy can provide lasting relief. At Shree Physiotherapy Clinic, Dr. Aarthi Ganesh uses Fascial Manipulation—an advanced Italian technique—to release restrictions in the neck and upper back fascia. Combined with manual therapy, strengthening exercises, and ergonomic advice, most patients experience significant improvement in 5-7 sessions.</p>

                <p><strong>Don't let tech neck become a chronic problem.</strong> Contact Shree Physiotherapy Clinic at 9092294466 for expert treatment in Coimbatore.</p>
            `
        },
        {
            title: "Cervical Spondylosis: Causes, Symptoms & Treatment",
            category: "Neck Pain",
            icon: "fas fa-head-side-virus",
            summary: "A comprehensive guide to understanding and treating cervical spondylosis with physiotherapy.",
            readTime: "7 min",
            trending: false,
            image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80",
            fullContent: `
                <h2>What is Cervical Spondylosis?</h2>
                <p>Cervical spondylosis is a degenerative condition affecting the cervical spine (neck region). It involves wear-and-tear changes in the spinal discs, vertebrae, and joints of the neck. Often called neck arthritis or cervical osteoarthritis, this condition affects more than 85% of people over age 60, though many experience no symptoms.</p>

                <p>At Shree Physiotherapy Clinic, Dr. Aarthi Ganesh specializes in treating cervical spondylosis using advanced physiotherapy techniques, helping patients avoid surgery and regain pain-free movement.</p>

                <h2>Causes of Cervical Spondylosis</h2>
                <ul>
                    <li><strong>Age-related wear:</strong> Disc dehydration and bone spur formation over time</li>
                    <li><strong>Occupation:</strong> Jobs requiring repetitive neck movements or prolonged looking up/down</li>
                    <li><strong>Poor posture:</strong> Forward head posture and desk work</li>
                    <li><strong>Previous injuries:</strong> Whiplash or other neck trauma</li>
                    <li><strong>Genetic factors:</strong> Family history of cervical problems</li>
                    <li><strong>Smoking:</strong> Reduces blood flow to spinal discs, accelerating degeneration</li>
                </ul>

                <h2>Symptoms of Cervical Spondylosis</h2>
                <p>Symptoms vary from mild to severe and may include:</p>
                <ul>
                    <li>Chronic neck pain and stiffness</li>
                    <li>Headaches, especially at the back of the head</li>
                    <li>Pain radiating to shoulders or arms</li>
                    <li>Grinding or popping sensation when moving the neck</li>
                    <li>Muscle weakness in arms or hands</li>
                    <li>Numbness or tingling in arms and fingers</li>
                    <li>Loss of balance (in severe cases)</li>
                    <li>Difficulty gripping objects</li>
                </ul>

                <h2>How Cervical Spondylosis is Diagnosed</h2>
                <p>Diagnosis typically involves a physical examination assessing range of motion, reflexes, and muscle strength. Dr. Aarthi Ganesh may recommend imaging tests such as X-rays, MRI, or CT scans to visualize the extent of degeneration and rule out other conditions.</p>

                <h2>Physiotherapy Treatment for Cervical Spondylosis</h2>
                <p>Physiotherapy is the first-line treatment for cervical spondylosis. At Shree Physiotherapy Clinic, our comprehensive approach includes:</p>

                <h3>Fascial Manipulation</h3>
                <p>This advanced Italian technique releases fascial restrictions that contribute to neck pain and stiffness. Dr. Aarthi Ganesh is certified in Fascial Manipulation and uses it to provide immediate pain relief.</p>

                <h3>Manual Therapy</h3>
                <p>Gentle joint mobilizations and soft tissue techniques improve neck mobility and reduce muscle spasms. This hands-on approach addresses the mechanical dysfunction caused by spondylosis.</p>

                <h3>Strengthening Exercises</h3>
                <p>Specific exercises strengthen the deep neck flexors and postural muscles, providing better support for the cervical spine. A customized home exercise program ensures continued progress.</p>

                <h3>Posture Correction</h3>
                <p>Learning proper posture for sitting, standing, and sleeping reduces stress on the cervical spine. Ergonomic modifications for work and home environments are also addressed.</p>

                <h3>Heat/Cold Therapy</h3>
                <p>Application of heat or cold helps manage pain and muscle spasms, complementing other treatments.</p>

                <h2>Recovery Timeline</h2>
                <p>Most patients experience significant improvement within 5-10 physiotherapy sessions. While cervical spondylosis cannot be reversed, proper management prevents progression and maintains quality of life. Regular exercise and good posture habits are essential for long-term success.</p>

                <p><strong>Don't let cervical spondylosis limit your life.</strong> Call Shree Physiotherapy Clinic at 9092294466 for expert treatment in Coimbatore.</p>
            `
        },
        {
            title: "Pillow Selection for Neck Pain Prevention",
            category: "Neck Pain",
            icon: "fas fa-bed",
            summary: "How the right pillow can prevent morning neck stiffness and chronic neck pain.",
            readTime: "4 min",
            trending: false,
            image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80",
            fullContent: `
                <h2>Why Your Pillow Matters for Neck Health</h2>
                <p>You spend approximately one-third of your life sleeping, and during that time, your pillow is responsible for supporting your neck and maintaining proper spinal alignment. The wrong pillow can cause or worsen neck pain, headaches, and even contribute to conditions like cervical spondylosis. At Shree Physiotherapy Clinic, Dr. Aarthi Ganesh often finds that a simple pillow change significantly improves patients' neck pain.</p>

                <h2>Signs Your Pillow is Wrong for You</h2>
                <ul>
                    <li>Waking up with neck stiffness or pain</li>
                    <li>Headaches that start in the morning</li>
                    <li>Numbness or tingling in arms upon waking</li>
                    <li>Constantly adjusting or folding your pillow</li>
                    <li>Neck pain that improves as the day goes on</li>
                    <li>Pillow is more than 2 years old and lumpy</li>
                </ul>

                <h2>The Goal: Neutral Spine Alignment</h2>
                <p>The ideal pillow keeps your head, neck, and spine in a neutral alignment—the same posture as standing with good posture. Your pillow should fill the gap between your neck and the mattress without tilting your head too high or letting it drop too low.</p>

                <h2>Pillow Recommendations by Sleep Position</h2>

                <h3>Back Sleepers</h3>
                <p>Choose a medium-loft pillow that supports the natural curve of your neck. The pillow should be thicker at the bottom where your neck rests and thinner under your head. Memory foam contour pillows work well for back sleepers. Avoid thick pillows that push your head forward.</p>

                <h3>Side Sleepers</h3>
                <p>You need a firmer, higher pillow to fill the space between your shoulder and head. The pillow should keep your spine straight—not angled up or down. Consider placing a pillow between your knees to maintain spinal alignment. Side sleepers often need to replace pillows more frequently as they compress under shoulder pressure.</p>

                <h3>Stomach Sleepers</h3>
                <p>This position is generally not recommended as it forces your neck to turn to one side. If you must sleep on your stomach, use a very thin, soft pillow or no pillow at all. Better yet, work on transitioning to side or back sleeping with physiotherapy guidance.</p>

                <h2>Pillow Materials Compared</h2>

                <h3>Memory Foam</h3>
                <p>Contours to your neck shape, provides consistent support. Can retain heat. Best for back sleepers and those with chronic neck pain.</p>

                <h3>Latex</h3>
                <p>Responsive and supportive, cooler than memory foam. Hypoallergenic. Good for all sleep positions.</p>

                <h3>Down/Feather</h3>
                <p>Soft and adjustable but lacks consistent support. Not ideal for neck pain sufferers.</p>

                <h3>Buckwheat</h3>
                <p>Firm and adjustable, allows air circulation. Can be noisy. Good for those who prefer firm support.</p>

                <h2>Cervical Pillows: Are They Worth It?</h2>
                <p>Cervical pillows (also called orthopedic pillows) are specifically designed to support the neck's natural curve. They typically have a contoured shape with a raised area for the neck and a depression for the head. These pillows can be beneficial for people with neck pain, cervical spondylosis, or those recovering from neck injuries.</p>

                <h2>When to Replace Your Pillow</h2>
                <p>Most pillows should be replaced every 1-2 years. A simple test: fold your pillow in half. If it doesn't spring back, it's time for a new one. Memory foam and latex pillows typically last longer than down or synthetic options.</p>

                <p><strong>Still struggling with neck pain?</strong> The right pillow helps, but chronic neck pain often requires professional treatment. Contact Shree Physiotherapy Clinic at 9092294466 for comprehensive neck pain treatment in Coimbatore.</p>
            `
        },
        // Knee Pain Articles
        {
            title: "Knee Pain After 40: What You Need to Know",
            category: "Knee Pain",
            icon: "fas fa-bone",
            summary: "Understanding age-related knee changes and how physiotherapy can keep you active.",
            readTime: "6 min",
            trending: true,
            image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80",
            fullContent: `
                <h2>Why Knee Pain Increases After 40</h2>
                <p>If you've noticed your knees starting to ache, click, or feel stiff as you've gotten older, you're not alone. Knee pain is one of the most common complaints among adults over 40, affecting millions of people worldwide. Understanding why this happens—and what you can do about it—can help you stay active and pain-free for years to come.</p>

                <h2>Age-Related Changes in the Knee</h2>

                <h3>Cartilage Wear</h3>
                <p>The cartilage that cushions your knee joint gradually thins with age. This protective tissue doesn't regenerate easily, leading to increased friction between bones. When cartilage wears significantly, it's called osteoarthritis—the most common cause of knee pain after 40.</p>

                <h3>Meniscus Changes</h3>
                <p>The meniscus (the shock-absorbing disc in your knee) becomes drier and more brittle with age. This makes it more susceptible to tears, even from minor twisting movements.</p>

                <h3>Muscle Weakness</h3>
                <p>Muscle mass naturally decreases as we age (sarcopenia), including the quadriceps and hamstrings that support the knee. Weaker muscles mean more stress on the joint itself.</p>

                <h3>Ligament Laxity</h3>
                <p>Ligaments lose some elasticity over time, potentially affecting knee stability and alignment.</p>

                <h2>Common Causes of Knee Pain After 40</h2>
                <ul>
                    <li><strong>Osteoarthritis:</strong> The most common cause, characterized by pain, stiffness, and swelling</li>
                    <li><strong>Meniscus tears:</strong> Often from twisting movements, causing catching or locking</li>
                    <li><strong>Patellofemoral syndrome:</strong> Pain around the kneecap, especially when climbing stairs</li>
                    <li><strong>Bursitis:</strong> Inflammation of fluid-filled sacs around the knee</li>
                    <li><strong>Tendinitis:</strong> Irritation of tendons, common in active individuals</li>
                </ul>

                <h2>Warning Signs to Watch For</h2>
                <p>Seek medical attention if you experience:</p>
                <ul>
                    <li>Severe pain that prevents weight-bearing</li>
                    <li>Significant swelling that doesn't improve</li>
                    <li>Knee that gives way or feels unstable</li>
                    <li>Locked knee that won't straighten or bend</li>
                    <li>Fever along with knee redness and warmth</li>
                </ul>

                <h2>How Physiotherapy Helps Knee Pain</h2>
                <p>At Shree Physiotherapy Clinic, Dr. Aarthi Ganesh uses evidence-based treatments to manage knee pain and slow the progression of arthritis:</p>

                <h3>Strengthening Exercises</h3>
                <p>Building the quadriceps, hamstrings, and hip muscles reduces stress on the knee joint. Strong muscles act as shock absorbers, protecting worn cartilage.</p>

                <h3>Manual Therapy</h3>
                <p>Hands-on techniques improve joint mobility, reduce stiffness, and decrease pain. Fascial Manipulation addresses connective tissue restrictions that contribute to knee dysfunction.</p>

                <h3>Balance Training</h3>
                <p>Improving balance and proprioception (joint position sense) prevents falls and enhances knee stability.</p>

                <h3>Activity Modification</h3>
                <p>Learning to exercise and move in ways that protect your knees while staying active.</p>

                <h2>Can Physiotherapy Prevent Knee Surgery?</h2>
                <p>Yes, in many cases. Research shows that physiotherapy can be as effective as surgery for meniscus tears and can delay or prevent knee replacement in arthritis. At Shree Physiotherapy Clinic, we've helped many patients avoid surgery through comprehensive rehabilitation.</p>

                <p><strong>Don't let knee pain slow you down.</strong> Contact Shree Physiotherapy Clinic at 9092294466 for expert knee treatment in Coimbatore.</p>
            `
        },
        {
            title: "Pre-Surgery Exercises for Knee Replacement",
            category: "Knee Pain",
            icon: "fas fa-hospital",
            summary: "Prehabilitation exercises that can improve your recovery after knee replacement surgery.",
            readTime: "5 min",
            trending: false,
            image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80",
            fullContent: `
                <h2>What is Prehabilitation?</h2>
                <p>Prehabilitation, or "prehab," refers to exercises and preparation done before surgery to improve outcomes afterward. Research shows that patients who engage in prehabilitation before knee replacement surgery experience faster recovery, less pain, shorter hospital stays, and better long-term function.</p>

                <p>At Shree Physiotherapy Clinic, Dr. Aarthi Ganesh provides comprehensive prehabilitation programs for patients preparing for knee replacement surgery in Coimbatore.</p>

                <h2>Why Prehabilitation Works</h2>
                <ul>
                    <li>Stronger muscles before surgery means easier rehabilitation after</li>
                    <li>Better cardiovascular fitness aids recovery</li>
                    <li>Patients learn exercises they'll need post-surgery</li>
                    <li>Improved range of motion pre-surgery correlates with better post-surgery mobility</li>
                    <li>Reduced anxiety through preparation and education</li>
                </ul>

                <h2>Essential Prehab Exercises for Knee Replacement</h2>

                <h3>1. Quadriceps Sets</h3>
                <p>Sit or lie with your leg straight. Tighten the muscles on top of your thigh by pressing the back of your knee down. Hold for 5-10 seconds, relax, and repeat 20 times. This exercise is fundamental for knee surgery recovery.</p>

                <h3>2. Straight Leg Raises</h3>
                <p>Lie on your back with one knee bent. Keep the other leg straight and raise it about 12 inches off the ground. Hold for 5 seconds, then lower slowly. Repeat 10-15 times per leg. This strengthens the quadriceps without bending the knee.</p>

                <h3>3. Heel Slides</h3>
                <p>Lie on your back with legs straight. Slowly bend your knee, sliding your heel toward your buttocks. Hold briefly, then straighten. Repeat 15-20 times. This maintains knee range of motion.</p>

                <h3>4. Ankle Pumps</h3>
                <p>Move your foot up and down at the ankle, pumping your calf muscle. Perform 20-30 repetitions several times daily. This prevents blood clots and maintains ankle mobility.</p>

                <h3>5. Hip Abduction</h3>
                <p>Lie on your side with the affected leg on top. Keep your leg straight and lift it toward the ceiling. Hold for 3 seconds and lower. Repeat 15 times. Strong hip muscles improve walking after surgery.</p>

                <h3>6. Seated Knee Extension</h3>
                <p>Sit in a chair with feet on the floor. Slowly straighten your knee, lifting your foot. Hold for 5 seconds, then lower. Repeat 15 times per leg. This exercise targets the quadriceps in a functional position.</p>

                <h3>7. Mini Squats</h3>
                <p>Stand holding onto a counter or chair for balance. Bend your knees slightly as if sitting back, keeping your knees behind your toes. Rise back up. Repeat 10-15 times. This strengthens the entire leg.</p>

                <h2>When to Start Prehabilitation</h2>
                <p>Ideally, begin prehab 4-6 weeks before your scheduled surgery. However, even 2-3 weeks of preparation can make a difference. The sooner you start, the better prepared you'll be.</p>

                <h2>Additional Preparation Tips</h2>
                <ul>
                    <li>Practice walking with crutches or a walker before surgery</li>
                    <li>Prepare your home: remove tripping hazards, install grab bars, arrange furniture for mobility aid use</li>
                    <li>Stock up on easy-to-prepare meals</li>
                    <li>Arrange for help during the first few weeks after surgery</li>
                    <li>Stop smoking at least 4 weeks before surgery to improve healing</li>
                </ul>

                <h2>Professional Prehab at Shree Physiotherapy Clinic</h2>
                <p>A supervised prehabilitation program ensures you're doing exercises correctly and progressing appropriately. Dr. Aarthi Ganesh provides personalized prehab programs including exercise training, manual therapy to optimize knee mobility, and education about what to expect after surgery.</p>

                <p><strong>Preparing for knee replacement?</strong> Contact Shree Physiotherapy Clinic at 9092294466 for comprehensive prehabilitation in Coimbatore.</p>
            `
        },
        // Shoulder Pain Articles
        {
            title: "Frozen Shoulder: The 3 Stages of Recovery",
            category: "Shoulder Pain",
            icon: "fas fa-hand-sparkles",
            summary: "Understanding the freezing, frozen, and thawing stages of adhesive capsulitis and how to treat each.",
            readTime: "6 min",
            trending: true,
            image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80",
            fullContent: `
                <h2>What is Frozen Shoulder?</h2>
                <p>Frozen shoulder, medically known as adhesive capsulitis, is a condition characterized by pain and progressive stiffness of the shoulder joint. The shoulder capsule—the connective tissue surrounding the joint—becomes thick, tight, and inflamed, severely limiting movement. At Shree Physiotherapy Clinic, Dr. Aarthi Ganesh has successfully treated hundreds of frozen shoulder cases using specialized techniques including Fascial Manipulation.</p>

                <h2>Who Gets Frozen Shoulder?</h2>
                <p>Frozen shoulder most commonly affects people between 40-60 years old and is more common in women. Risk factors include:</p>
                <ul>
                    <li>Diabetes (affects 10-20% of diabetics)</li>
                    <li>Thyroid disorders</li>
                    <li>Recent shoulder injury or surgery</li>
                    <li>Prolonged immobilization</li>
                    <li>Cardiovascular disease</li>
                    <li>Parkinson's disease</li>
                </ul>

                <h2>The Three Stages of Frozen Shoulder</h2>

                <h3>Stage 1: Freezing Stage (2-9 months)</h3>
                <p><strong>Symptoms:</strong> Gradual onset of diffuse, intense shoulder pain. Pain is often worse at night and may disturb sleep. Movement becomes increasingly limited, though stiffness is not yet severe.</p>
                <p><strong>What's happening:</strong> The shoulder capsule is becoming inflamed and starting to form adhesions (scar tissue).</p>
                <p><strong>Treatment focus:</strong> Pain management, gentle range-of-motion exercises within pain tolerance, heat therapy, and anti-inflammatory measures. Aggressive stretching should be avoided as it can worsen inflammation.</p>

                <h3>Stage 2: Frozen Stage (4-12 months)</h3>
                <p><strong>Symptoms:</strong> Pain may start to decrease, but stiffness becomes severe. Reaching overhead, behind the back, or out to the side becomes extremely difficult. Daily activities like dressing, washing hair, and reaching for objects are challenging.</p>
                <p><strong>What's happening:</strong> Inflammation is subsiding, but the capsule has thickened significantly. Adhesions have formed, restricting movement.</p>
                <p><strong>Treatment focus:</strong> Progressive stretching exercises, manual therapy to improve joint mobility, Fascial Manipulation to address tissue restrictions. This is when physiotherapy can be most aggressive in improving range of motion.</p>

                <h3>Stage 3: Thawing Stage (6-24 months)</h3>
                <p><strong>Symptoms:</strong> Gradual improvement in range of motion. Pain continues to decrease. Movement slowly returns toward normal.</p>
                <p><strong>What's happening:</strong> The capsule is gradually loosening. Adhesions are breaking down.</p>
                <p><strong>Treatment focus:</strong> Continue stretching and strengthening exercises, functional training to return to normal activities, maintenance program to prevent recurrence.</p>

                <h2>How Physiotherapy Accelerates Recovery</h2>
                <p>While frozen shoulder can eventually resolve on its own, this process can take 2-3 years. Proper physiotherapy treatment can significantly shorten this timeline and improve outcomes.</p>

                <h3>Fascial Manipulation</h3>
                <p>Dr. Aarthi Ganesh uses this specialized Italian technique to release fascial restrictions around the shoulder. Many patients experience immediate improvement in range of motion after Fascial Manipulation sessions.</p>

                <h3>Manual Therapy</h3>
                <p>Joint mobilizations and capsular stretching performed by a skilled physiotherapist can help break down adhesions and restore mobility.</p>

                <h3>Home Exercise Program</h3>
                <p>Consistent daily stretching is essential. Exercises include pendulum swings, wall walks, towel stretches, and cross-body stretches. Dr. Aarthi provides a customized program based on your stage of recovery.</p>

                <h2>Expected Recovery Timeline with Treatment</h2>
                <p>With proper physiotherapy treatment at Shree Physiotherapy Clinic, most patients see significant improvement in 10-15 sessions over 3-6 months. Early intervention leads to faster recovery. 85% of our patients regain full or near-full shoulder mobility.</p>

                <p><strong>Don't wait for frozen shoulder to "thaw" on its own.</strong> Contact Shree Physiotherapy Clinic at 9092294466 for expert treatment in Coimbatore.</p>
            `
        },
        {
            title: "Rotator Cuff Strengthening Exercises",
            category: "Shoulder Pain",
            icon: "fas fa-dumbbell",
            summary: "Essential exercises to strengthen and protect your rotator cuff muscles.",
            readTime: "5 min",
            trending: false,
            image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80",
            fullContent: `
                <h2>Understanding the Rotator Cuff</h2>
                <p>The rotator cuff is a group of four muscles and their tendons that surround the shoulder joint: supraspinatus, infraspinatus, teres minor, and subscapularis. These muscles work together to stabilize the shoulder and enable arm rotation. Despite their importance, the rotator cuff muscles are often overlooked in general fitness programs, making them vulnerable to injury.</p>

                <h2>Why Rotator Cuff Strength Matters</h2>
                <ul>
                    <li>Prevents shoulder impingement and tendinitis</li>
                    <li>Reduces risk of rotator cuff tears</li>
                    <li>Improves shoulder stability and function</li>
                    <li>Enhances performance in sports and daily activities</li>
                    <li>Protects against age-related shoulder problems</li>
                </ul>

                <h2>6 Essential Rotator Cuff Exercises</h2>
                <p>These exercises are recommended by Dr. Aarthi Ganesh at Shree Physiotherapy Clinic. Start with light resistance (1-2 kg or resistance band) and progress gradually.</p>

                <h3>1. External Rotation with Resistance Band</h3>
                <p>Stand with your elbow bent at 90 degrees, tucked against your side. Hold a resistance band attached to a door handle or fixed point. Rotate your forearm outward, keeping your elbow stationary. Slowly return. Repeat 15 times, 3 sets per arm. This targets the infraspinatus and teres minor.</p>

                <h3>2. Internal Rotation with Resistance Band</h3>
                <p>Same setup as above, but rotate your forearm inward toward your body. This strengthens the subscapularis. Perform 15 repetitions, 3 sets per arm.</p>

                <h3>3. Side-Lying External Rotation</h3>
                <p>Lie on your side with a light dumbbell in your top hand. Keep your elbow bent at 90 degrees and pressed against your side. Rotate your forearm upward toward the ceiling, then lower slowly. Repeat 15 times, 3 sets. This is excellent for isolating the external rotators.</p>

                <h3>4. Prone Y-T-W Raises</h3>
                <p>Lie face down on a bench or bed with arms hanging down. Raise both arms to form a "Y" shape, hold briefly, and lower. Repeat forming a "T" shape (arms out to sides), then "W" shape (elbows bent, hands near head). Perform 10 repetitions of each letter. These exercises target all rotator cuff muscles plus the lower trapezius.</p>

                <h3>5. High Pull to External Rotation</h3>
                <p>Using a resistance band at waist height, pull your elbow up and back, then rotate your forearm up toward the ceiling. This combines pulling and rotation, mimicking functional shoulder movements. Perform 12 repetitions, 3 sets per arm.</p>

                <h3>6. Isometric Rotator Cuff Holds</h3>
                <p>Press your hand against a wall or door frame as if trying to rotate your arm, but don't allow movement. Hold for 10 seconds in both internal and external rotation positions. Repeat 5 times each direction. Isometric exercises are especially useful during injury recovery or when movement is painful.</p>

                <h2>Exercise Guidelines</h2>
                <ul>
                    <li>Perform these exercises 3 times per week for maintenance</li>
                    <li>Warm up with arm circles and shoulder rolls before strengthening</li>
                    <li>Focus on slow, controlled movements—no jerking or swinging</li>
                    <li>Stop if you experience sharp pain (mild muscle fatigue is normal)</li>
                    <li>Progress resistance gradually—increase only when 15 reps become easy</li>
                </ul>

                <h2>When to See a Physiotherapist</h2>
                <p>If you're experiencing shoulder pain, clicking, or weakness, see a physiotherapist before starting these exercises. At Shree Physiotherapy Clinic, Dr. Aarthi Ganesh can assess your shoulder, identify any underlying problems, and provide a customized rehabilitation program.</p>

                <p><strong>Protect your shoulders for life.</strong> Contact Shree Physiotherapy Clinic at 9092294466 for shoulder assessment and treatment in Coimbatore.</p>
            `
        },
        // Women's Health Articles
        {
            title: "Pregnancy Back Pain: Safe Exercises for Each Trimester",
            category: "Women's Health",
            icon: "fas fa-baby",
            summary: "Physiotherapist-approved exercises to relieve back pain during pregnancy safely.",
            readTime: "7 min",
            trending: true,
            image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80",
            fullContent: `
                <h2>Why Back Pain is Common During Pregnancy</h2>
                <p>Back pain affects 50-80% of pregnant women, making it one of the most common discomforts of pregnancy. Several factors contribute to this pain: hormonal changes that loosen ligaments, shifting center of gravity as the belly grows, weight gain that stresses the spine, and postural changes to accommodate the growing baby.</p>

                <p>At Shree Physiotherapy Clinic, Dr. Aarthi Ganesh specializes in pre-natal physiotherapy, helping expectant mothers manage back pain safely throughout their pregnancy.</p>

                <h2>First Trimester (Weeks 1-12)</h2>
                <p>During the first trimester, hormonal changes begin affecting your ligaments, and fatigue may tempt you to skip exercise. However, gentle movement helps prevent back pain from developing.</p>

                <h3>Safe Exercises:</h3>

                <h4>Cat-Cow Stretch</h4>
                <p>On hands and knees, alternate between arching your back (cow) and rounding it (cat). Perform 10-15 repetitions. This gentle movement relieves spinal tension and maintains mobility.</p>

                <h4>Pelvic Tilts</h4>
                <p>Lie on your back (safe in first trimester) with knees bent. Flatten your lower back against the floor, hold for 5 seconds, release. Repeat 15-20 times. This strengthens the core and relieves lower back strain.</p>

                <h4>Walking</h4>
                <p>A daily 20-30 minute walk maintains cardiovascular fitness and strengthens supporting muscles without stressing joints.</p>

                <h2>Second Trimester (Weeks 13-26)</h2>
                <p>The belly is growing, and back pain often intensifies. Avoid lying flat on your back for extended periods as this can compress major blood vessels. Focus on maintaining core strength and good posture.</p>

                <h3>Safe Exercises:</h3>

                <h4>Side-Lying Leg Lifts</h4>
                <p>Lie on your side with legs stacked. Lift the top leg 12 inches, hold briefly, lower slowly. Repeat 15 times per side. This strengthens hip muscles that support the pelvis.</p>

                <h4>Seated Ball Exercises</h4>
                <p>Sit on a stability ball and practice gentle pelvic circles, tilts, and figure-eights. This maintains pelvic mobility and strengthens core muscles without straining the back.</p>

                <h4>Standing Cat-Cow</h4>
                <p>Place hands on a wall or countertop. Alternate between arching and rounding your spine. This modification allows continued benefit as belly grows.</p>

                <h4>Kegel Exercises</h4>
                <p>Contract pelvic floor muscles as if stopping urination, hold for 5-10 seconds, release. Repeat 10-15 times, several times daily. Strong pelvic floor muscles support the spine and prepare for delivery.</p>

                <h2>Third Trimester (Weeks 27-40)</h2>
                <p>The largest weight gain occurs now, and back pain often peaks. Exercise becomes more challenging but remains important. Focus on gentle stretching, pelvic stability, and positions that relieve pressure.</p>

                <h3>Safe Exercises:</h3>

                <h4>Child's Pose (Modified)</h4>
                <p>Kneel with knees wide apart to accommodate belly. Sit back on heels and reach arms forward. This stretches the lower back and provides relief from the weight of the belly.</p>

                <h4>Swimming or Water Aerobics</h4>
                <p>Water supports your body weight, relieving pressure on the spine while allowing exercise. Even gentle floating can provide significant relief.</p>

                <h4>Hands-and-Knees Position</h4>
                <p>Simply resting on hands and knees allows the belly to hang freely, relieving back pressure. Gentle rocking in this position can ease discomfort.</p>

                <h4>Squats (Supported)</h4>
                <p>Holding a stable support, lower into a squat, keeping knees over toes. This strengthens legs for labor and maintains hip flexibility.</p>

                <h2>Exercises to Avoid During Pregnancy</h2>
                <ul>
                    <li>High-impact activities and jumping</li>
                    <li>Exercises lying flat on back after first trimester</li>
                    <li>Deep twists that compress the abdomen</li>
                    <li>Hot yoga or exercises in hot environments</li>
                    <li>Activities with fall risk</li>
                </ul>

                <h2>When to Seek Professional Help</h2>
                <p>If back pain is severe, radiates down your legs, or is accompanied by other symptoms, consult Dr. Aarthi Ganesh at Shree Physiotherapy Clinic. Specialized pre-natal physiotherapy including manual therapy, tailored exercises, and supportive belting recommendations can provide significant relief.</p>

                <p><strong>Make your pregnancy more comfortable.</strong> Contact Shree Physiotherapy Clinic at 9092294466 for pre-natal physiotherapy in Coimbatore.</p>
            `
        },
        {
            title: "Diastasis Recti: Healing Abdominal Separation After Pregnancy",
            category: "Women's Health",
            icon: "fas fa-heart",
            summary: "Understanding diastasis recti and the physiotherapy approach to healing.",
            readTime: "6 min",
            trending: false,
            image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80",
            fullContent: `
                <h2>What is Diastasis Recti?</h2>
                <p>Diastasis recti is the separation of the rectus abdominis muscles—the "six-pack" muscles that run down the front of your abdomen. During pregnancy, the growing uterus stretches these muscles apart, and the connective tissue (linea alba) between them thins and widens. While some separation is normal during pregnancy, diastasis recti occurs when the gap doesn't close adequately after delivery.</p>

                <p>At Shree Physiotherapy Clinic, Dr. Aarthi Ganesh helps many new mothers recover from diastasis recti through specialized post-natal physiotherapy.</p>

                <h2>Signs and Symptoms of Diastasis Recti</h2>
                <ul>
                    <li>Visible bulge or ridge down the middle of the abdomen, especially when straining</li>
                    <li>Lower back pain</li>
                    <li>Poor posture</li>
                    <li>Feeling of weakness in the core</li>
                    <li>Difficulty lifting objects</li>
                    <li>"Mummy tummy" that doesn't flatten despite weight loss</li>
                    <li>Constipation or bloating</li>
                    <li>Pelvic floor dysfunction</li>
                </ul>

                <h2>How to Check for Diastasis Recti</h2>
                <p>Lie on your back with knees bent. Place your fingers horizontally across your belly button. Lift your head and shoulders slightly off the floor (like starting a crunch). Feel for a gap between the muscles. A separation of more than 2 finger-widths typically indicates diastasis recti that would benefit from treatment.</p>

                <h2>Why Proper Treatment is Important</h2>
                <p>Diastasis recti is not just a cosmetic concern. The separated abdominal muscles cannot properly support the spine, leading to back pain. The weakened core affects posture, pelvic floor function, and the ability to perform daily activities safely. Without proper rehabilitation, diastasis recti rarely fully resolves on its own.</p>

                <h2>Exercises to Heal Diastasis Recti</h2>

                <h3>1. Diaphragmatic Breathing</h3>
                <p>Lie comfortably with one hand on your chest and one on your belly. Breathe deeply into your belly, feeling it rise. As you exhale, gently draw your navel toward your spine. This activates the deep core muscles without straining the rectus abdominis.</p>

                <h3>2. Dead Bug Progressions</h3>
                <p>Lie on your back with knees bent at 90 degrees, feet lifted. Slowly lower one foot toward the floor while maintaining a flat lower back. Return and repeat with the other leg. Progress to extending the leg straight as you get stronger.</p>

                <h3>3. Heel Slides</h3>
                <p>Lie on your back with knees bent. Keeping your core engaged, slowly slide one heel along the floor to straighten the leg. Return and repeat on the other side. Perform 10 repetitions per leg.</p>

                <h3>4. Modified Plank on Knees</h3>
                <p>When ready, progress to a plank position on your knees and forearms. Keep your spine neutral and core engaged. Hold for 10-20 seconds, building duration gradually.</p>

                <h3>5. Standing Core Engagement</h3>
                <p>Practice engaging your deep core muscles during daily activities. Before lifting your baby, imagine hugging your baby with your stomach muscles. This functional core activation helps healing progress.</p>

                <h2>Exercises to AVOID with Diastasis Recti</h2>
                <ul>
                    <li>Traditional crunches and sit-ups</li>
                    <li>Planks (until core strength is sufficient)</li>
                    <li>Any exercise that causes the belly to dome or bulge outward</li>
                    <li>Heavy lifting without proper core engagement</li>
                    <li>Twisting movements</li>
                </ul>

                <h2>The Role of Physiotherapy in Diastasis Recti Recovery</h2>
                <p>At Shree Physiotherapy Clinic, Dr. Aarthi Ganesh provides comprehensive post-natal rehabilitation including assessment of separation width and depth, individualized exercise progression, manual therapy techniques, postural correction, and pelvic floor integration.</p>

                <h2>Recovery Timeline</h2>
                <p>With consistent, appropriate exercise, most women see significant improvement in 6-12 weeks. The linea alba can continue to heal and strengthen for up to two years postpartum. Early intervention leads to better outcomes.</p>

                <p><strong>Start your post-natal recovery journey.</strong> Contact Shree Physiotherapy Clinic at 9092294466 for specialized women's health physiotherapy in Coimbatore.</p>
            `
        },
        {
            title: "Pelvic Floor Exercises Every Woman Should Know",
            category: "Women's Health",
            icon: "fas fa-female",
            summary: "Essential pelvic floor exercises for prevention of incontinence and pelvic organ prolapse.",
            readTime: "5 min",
            trending: false,
            image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80",
            fullContent: `
                <h2>Understanding Your Pelvic Floor</h2>
                <p>The pelvic floor is a group of muscles that stretch like a hammock from your pubic bone to your tailbone. These muscles support your bladder, uterus, and bowel. They also control urination, bowel movements, and sexual function. Despite their importance, many women don't know these muscles exist until they develop problems.</p>

                <h2>Why Pelvic Floor Health Matters</h2>
                <p>Weak pelvic floor muscles can lead to urinary incontinence (leaking urine when coughing, sneezing, or exercising), fecal incontinence, pelvic organ prolapse (organs dropping into the vagina), reduced sexual sensation, and lower back pain. Pregnancy, childbirth, aging, obesity, chronic coughing, and heavy lifting can weaken these muscles.</p>

                <h2>The Benefits of Pelvic Floor Exercises</h2>
                <ul>
                    <li>Prevent and treat urinary incontinence</li>
                    <li>Support pelvic organs and prevent prolapse</li>
                    <li>Improve sexual function and sensation</li>
                    <li>Aid recovery after childbirth</li>
                    <li>Prepare for pregnancy and labor</li>
                    <li>Support core stability and back health</li>
                </ul>

                <h2>How to Find Your Pelvic Floor Muscles</h2>
                <p>The easiest way to identify your pelvic floor muscles is to try stopping your urine stream midflow. The muscles you use to do this are your pelvic floor muscles. However, don't regularly exercise while urinating as this can cause bladder problems. Use this technique only to identify the muscles.</p>

                <p>Another method: Insert a finger into your vagina and squeeze as if holding in urine. You should feel tightening around your finger.</p>

                <h2>Essential Pelvic Floor Exercises (Kegels)</h2>

                <h3>Basic Kegel Exercise</h3>
                <p>Squeeze your pelvic floor muscles as if trying to stop urinating and hold gas. Hold for 3-5 seconds, then relax completely for 3-5 seconds. Repeat 10 times. Build up to holding for 10 seconds. Perform 3 sets daily.</p>

                <h3>Quick Flicks</h3>
                <p>Quickly squeeze and release your pelvic floor muscles without holding. Perform 10-15 quick contractions in a row. This trains the fast-twitch muscle fibers that respond to sudden pressure (like sneezing).</p>

                <h3>The Elevator</h3>
                <p>Imagine your pelvic floor as an elevator. Contract gently for the first floor, then gradually increase the contraction for floors 2, 3, and 4. Hold at the top, then slowly release floor by floor. This develops control throughout the full range of movement.</p>

                <h3>Bridge with Pelvic Floor Engagement</h3>
                <p>Lie on your back with knees bent. Contract your pelvic floor, then lift your hips into a bridge position. Hold for 5 seconds while maintaining the pelvic floor contraction. Lower slowly and release. Repeat 10 times.</p>

                <h2>Tips for Effective Pelvic Floor Exercises</h2>
                <ul>
                    <li>Breathe normally—don't hold your breath</li>
                    <li>Keep your buttocks, thighs, and stomach muscles relaxed</li>
                    <li>Focus on lifting inward and upward, not pushing down</li>
                    <li>The relaxation phase is as important as the contraction</li>
                    <li>Perform exercises in various positions: lying, sitting, standing</li>
                    <li>Be consistent—results take 3-6 months of daily practice</li>
                </ul>

                <h2>When to See a Pelvic Floor Physiotherapist</h2>
                <p>If you're experiencing incontinence, pelvic pain, or feel pressure in your pelvic area, a pelvic floor physiotherapist can provide specialized assessment and treatment. At Shree Physiotherapy Clinic, Dr. Aarthi Ganesh offers women's health physiotherapy including biofeedback training and manual therapy techniques for pelvic floor dysfunction.</p>

                <p><strong>Take control of your pelvic health.</strong> Contact Shree Physiotherapy Clinic at 9092294466 for women's health physiotherapy in Coimbatore.</p>
            `
        },
        // Elderly Care Articles
        {
            title: "Balance Exercises to Prevent Falls in Seniors",
            category: "Elderly Care",
            icon: "fas fa-walking",
            summary: "Simple balance exercises that can significantly reduce fall risk in older adults.",
            readTime: "5 min",
            trending: true,
            image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80",
            fullContent: `
                <h2>Why Falls Are a Serious Concern for Seniors</h2>
                <p>Falls are the leading cause of injury among adults over 65. Each year, one in three seniors experiences a fall, often resulting in fractures, head injuries, and loss of independence. The fear of falling can also lead to reduced activity, further weakening muscles and worsening balance—a dangerous cycle.</p>

                <p>At Shree Physiotherapy Clinic, Dr. Aarthi Ganesh provides home physiotherapy services for elderly patients in Coimbatore, helping them improve balance and prevent falls in their own environment.</p>

                <h2>Risk Factors for Falls</h2>
                <ul>
                    <li>Muscle weakness, especially in the legs</li>
                    <li>Balance and gait problems</li>
                    <li>Vision impairment</li>
                    <li>Medications that cause dizziness</li>
                    <li>Home hazards (loose rugs, poor lighting)</li>
                    <li>Foot problems and inappropriate footwear</li>
                    <li>Chronic conditions like arthritis, Parkinson's, or stroke</li>
                </ul>

                <h2>6 Balance Exercises for Seniors</h2>
                <p>These exercises should be performed near a sturdy chair or counter for support. Progress gradually from easier to more challenging versions.</p>

                <h3>1. Single Leg Stand</h3>
                <p>Hold onto a chair and lift one foot slightly off the ground. Try to balance for 10-30 seconds. Switch legs. As you improve, try with lighter hand support, then just fingertips, then without holding. Perform 3-5 times per leg.</p>

                <h3>2. Heel-to-Toe Walk</h3>
                <p>Walk in a straight line, placing the heel of one foot directly in front of the toes of the other foot. Take 15-20 steps. Use a wall or counter for support initially. This mimics the natural walking pattern and challenges balance.</p>

                <h3>3. Side Leg Raises</h3>
                <p>Hold onto a chair and slowly lift one leg out to the side, keeping your back straight and toes facing forward. Hold for 3 seconds, lower slowly. Repeat 10-15 times per leg. This strengthens the hip abductors essential for stability.</p>

                <h3>4. Heel Raises</h3>
                <p>Hold onto a chair and slowly rise up onto your toes. Hold for 3 seconds, then lower slowly. Repeat 15-20 times. This strengthens the calf muscles used in walking and balance recovery.</p>

                <h3>5. Sit-to-Stand</h3>
                <p>Sit in a firm chair with feet flat on the floor. Stand up without using your hands if possible. Sit down slowly. Repeat 10 times. This strengthens the quadriceps and practices a movement performed dozens of times daily.</p>

                <h3>6. Weight Shifts</h3>
                <p>Stand with feet hip-width apart. Shift your weight onto your right foot, lifting the left foot slightly. Hold for 10 seconds. Switch sides. Progress to holding longer and reducing hand support.</p>

                <h2>Making Balance Exercises a Habit</h2>
                <ul>
                    <li>Practice balance exercises daily for best results</li>
                    <li>Do single leg stands while brushing teeth or waiting for the kettle</li>
                    <li>Perform heel raises while washing dishes</li>
                    <li>Practice weight shifts while watching television</li>
                    <li>Walk heel-to-toe down hallways</li>
                </ul>

                <h2>Home Safety Modifications</h2>
                <p>During home physiotherapy visits, Dr. Aarthi Ganesh also assesses your home for fall hazards and recommends modifications such as removing loose rugs, adding grab bars in bathrooms, improving lighting, and rearranging furniture for clear pathways.</p>

                <h2>The Benefits of Home Physiotherapy for Seniors</h2>
                <p>Home-based physiotherapy allows treatment in the environment where falls are most likely to occur. The therapist can identify specific hazards, observe real-world function, and design exercises using available furniture and spaces.</p>

                <p><strong>Protect your independence.</strong> Contact Shree Physiotherapy Clinic at 9092294466 for home physiotherapy services in Coimbatore.</p>
            `
        },
        {
            title: "Home Modifications for Elderly Safety",
            category: "Elderly Care",
            icon: "fas fa-home",
            summary: "How to make your home safer for elderly family members to prevent injuries.",
            readTime: "4 min",
            trending: false,
            image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80",
            fullContent: `
                <h2>Creating a Fall-Safe Home for Seniors</h2>
                <p>Most falls among the elderly occur at home, making home safety modifications essential for preventing injuries. Simple changes can dramatically reduce fall risk while allowing seniors to maintain their independence. At Shree Physiotherapy Clinic, Dr. Aarthi Ganesh includes home safety assessments as part of elderly home physiotherapy visits in Coimbatore.</p>

                <h2>Bathroom Safety</h2>
                <p>The bathroom is the most dangerous room for seniors due to wet surfaces and hard fixtures.</p>
                <ul>
                    <li><strong>Grab bars:</strong> Install sturdy grab bars next to the toilet and inside the shower/bathtub. Ensure they're properly anchored into wall studs.</li>
                    <li><strong>Non-slip mats:</strong> Place textured mats inside the tub/shower and on the floor outside.</li>
                    <li><strong>Raised toilet seat:</strong> Makes sitting and standing easier, reducing strain and fall risk.</li>
                    <li><strong>Shower chair/bench:</strong> Allows bathing while seated for those with balance issues.</li>
                    <li><strong>Handheld showerhead:</strong> Enables washing while seated and reduces need to reach.</li>
                    <li><strong>Night light:</strong> Illuminates the path for nighttime bathroom visits.</li>
                </ul>

                <h2>Bedroom Safety</h2>
                <ul>
                    <li><strong>Bed height:</strong> The bed should be low enough to get into but high enough to stand from easily. Knees should bend at 90 degrees when sitting on the edge.</li>
                    <li><strong>Bedside lighting:</strong> Place a lamp within easy reach. Consider motion-activated lights.</li>
                    <li><strong>Clear pathway:</strong> Remove clutter between bed and bathroom.</li>
                    <li><strong>Phone accessibility:</strong> Keep a phone by the bedside for emergencies.</li>
                    <li><strong>Bed rails:</strong> Can help with positioning but choose carefully to avoid entrapment risks.</li>
                </ul>

                <h2>Living Areas and Hallways</h2>
                <ul>
                    <li><strong>Remove loose rugs:</strong> Throw rugs are a major tripping hazard. Remove them or secure with double-sided tape.</li>
                    <li><strong>Secure electrical cords:</strong> Run cords along walls, never across walkways.</li>
                    <li><strong>Improve lighting:</strong> Add brighter bulbs and ensure light switches are at both ends of hallways.</li>
                    <li><strong>Furniture arrangement:</strong> Create wide, clear pathways. Remove low tables and footstools from walking paths.</li>
                    <li><strong>Chair selection:</strong> Use firm chairs with armrests that make standing easier.</li>
                    <li><strong>Non-slip flooring:</strong> Consider replacing slippery floors with textured, non-slip options.</li>
                </ul>

                <h2>Stairs Safety</h2>
                <ul>
                    <li><strong>Handrails:</strong> Install sturdy handrails on both sides of stairs.</li>
                    <li><strong>Visibility:</strong> Mark edges of steps with contrasting tape.</li>
                    <li><strong>Good lighting:</strong> Install lights at top and bottom of stairs with switches at both locations.</li>
                    <li><strong>Remove obstacles:</strong> Never store items on stairs.</li>
                    <li><strong>Consider a stairlift:</strong> For those with significant mobility challenges.</li>
                </ul>

                <h2>Kitchen Safety</h2>
                <ul>
                    <li><strong>Frequently used items:</strong> Store at waist to shoulder height to avoid reaching or bending.</li>
                    <li><strong>Step stools:</strong> If needed, use only sturdy stools with handrails.</li>
                    <li><strong>Non-slip mats:</strong> Place in front of sink and stove.</li>
                    <li><strong>Automatic shut-off appliances:</strong> Consider kettles and irons with automatic shut-off features.</li>
                </ul>

                <h2>General Recommendations</h2>
                <ul>
                    <li>Install smoke detectors and carbon monoxide alarms</li>
                    <li>Keep emergency numbers posted visibly</li>
                    <li>Consider a medical alert system for those living alone</li>
                    <li>Ensure glasses and hearing aids are worn and working properly</li>
                    <li>Review medications with a doctor for those that cause dizziness</li>
                    <li>Wear supportive, non-slip footwear—even indoors</li>
                </ul>

                <h2>Professional Home Assessment</h2>
                <p>Dr. Aarthi Ganesh at Shree Physiotherapy Clinic provides in-home assessments for elderly patients, identifying specific fall hazards and recommending modifications tailored to the individual's needs and abilities.</p>

                <p><strong>Make your home safer for your loved ones.</strong> Contact Shree Physiotherapy Clinic at 9092294466 for elderly home physiotherapy and safety assessment in Coimbatore.</p>
            `
        },
        // Sports & Rehabilitation
        {
            title: "ACL Injury Prevention for Athletes",
            category: "Sports Rehab",
            icon: "fas fa-running",
            summary: "Key exercises and techniques to prevent ACL injuries in sports activities.",
            readTime: "6 min",
            trending: true,
            image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80",
            fullContent: `
                <h2>Understanding ACL Injuries</h2>
                <p>The anterior cruciate ligament (ACL) is one of the major ligaments in the knee, providing stability during cutting, pivoting, and jumping movements. ACL tears are among the most feared injuries in sports, often requiring surgery and 6-12 months of rehabilitation. However, research shows that up to 70% of ACL injuries can be prevented with proper training.</p>

                <p>At Shree Physiotherapy Clinic, Dr. Aarthi Ganesh provides sports injury prevention programs and rehabilitation for athletes in Coimbatore.</p>

                <h2>Who is at Risk?</h2>
                <ul>
                    <li>Athletes in sports involving cutting, pivoting, and jumping (football, basketball, kabaddi, badminton, tennis)</li>
                    <li>Female athletes (2-8 times higher risk than males)</li>
                    <li>Those with previous knee injuries</li>
                    <li>Athletes with muscle imbalances or poor movement patterns</li>
                    <li>Those who don't warm up properly</li>
                </ul>

                <h2>How ACL Injuries Occur</h2>
                <p>Most ACL tears (70-80%) are non-contact injuries, occurring when an athlete lands from a jump with the knee straight and rotated inward, suddenly decelerates or changes direction, or hyperextends the knee. Understanding these mechanisms allows us to train the body to move more safely.</p>

                <h2>ACL Prevention Exercises</h2>

                <h3>1. Single-Leg Balance Training</h3>
                <p>Stand on one leg for 30-60 seconds. Progress by closing eyes, standing on an unstable surface, or catching a ball while balancing. This improves proprioception—your body's awareness of joint position.</p>

                <h3>2. Lateral Hops</h3>
                <p>Hop side to side over a line, landing softly with bent knees. Focus on controlling the landing with your knee tracking over your toes (not collapsing inward). Perform 20 hops in each direction.</p>

                <h3>3. Box Jumps with Soft Landing</h3>
                <p>Jump onto a low box (30-45 cm) and land softly with bent knees. The emphasis is on the landing—absorbing force through your muscles, not your joints. Perform 10-15 jumps.</p>

                <h3>4. Single-Leg Squats</h3>
                <p>Stand on one leg and slowly lower into a quarter squat, keeping your knee aligned over your second toe. Don't let the knee collapse inward. Perform 10-15 repetitions per leg.</p>

                <h3>5. Hamstring Strengthening</h3>
                <p>Nordic hamstring curls: Kneel with feet anchored, slowly lower your body forward, then push back up using hamstrings. Perform 8-10 repetitions. Strong hamstrings protect the ACL by preventing excessive forward movement of the shin bone.</p>

                <h3>6. Hip and Glute Strengthening</h3>
                <p>Side-lying clamshells, hip bridges, and lateral band walks strengthen the muscles that control hip and knee position during athletic movements.</p>

                <h3>7. Plyometric Training</h3>
                <p>Controlled jumping and landing drills train the neuromuscular system to react quickly and safely. Start with low-intensity drills and progress gradually.</p>

                <h2>Movement Technique Training</h2>
                <p>Proper technique is as important as strength. Key points include landing with knees bent, not straight; keeping knees aligned over toes (not collapsing inward); decelerating through multiple steps when possible; maintaining core stability during cutting movements; and pivoting with the whole body, not just twisting at the knee.</p>

                <h2>Warm-Up Protocol</h2>
                <p>Research shows that programs like FIFA 11+ reduce ACL injuries by 30-50% when performed consistently before training and matches. A proper warm-up should include jogging, dynamic stretching, balance exercises, and sport-specific agility drills.</p>

                <h2>Sports-Specific Prevention Programs</h2>
                <p>At Shree Physiotherapy Clinic, Dr. Aarthi Ganesh designs sport-specific prevention programs based on the demands of your activity, your individual risk factors, and any previous injuries. Regular screening can identify movement patterns that increase injury risk.</p>

                <p><strong>Protect your athletic career.</strong> Contact Shree Physiotherapy Clinic at 9092294466 for sports injury prevention and rehabilitation in Coimbatore.</p>
            `
        },
        {
            title: "Post-Fracture Rehabilitation Timeline",
            category: "Rehabilitation",
            icon: "fas fa-bone",
            summary: "What to expect during recovery after a bone fracture and when to start physiotherapy.",
            readTime: "5 min",
            trending: false,
            image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80",
            fullContent: `
                <h2>Understanding Fracture Healing</h2>
                <p>A bone fracture triggers a complex healing process that typically takes 6-12 weeks, depending on the bone involved, fracture severity, patient age, and overall health. Understanding this process helps set realistic expectations for rehabilitation.</p>

                <p>At Shree Physiotherapy Clinic, Dr. Aarthi Ganesh guides patients through every phase of fracture rehabilitation, from early protected movement to full return to activity.</p>

                <h2>Phases of Bone Healing</h2>

                <h3>Inflammatory Phase (Days 1-7)</h3>
                <p>Blood clots form at the fracture site, and inflammatory cells clean up damaged tissue. Swelling and pain are at their peak.</p>

                <h3>Repair Phase (Weeks 2-6)</h3>
                <p>Soft callus (cartilage) forms to bridge the fracture, then gradually hardens into bone. The fracture site is still fragile and needs protection.</p>

                <h3>Remodeling Phase (Weeks 6-12+)</h3>
                <p>New bone is reshaped in response to stress and movement. The bone gradually returns to its original strength. This phase can continue for months to years.</p>

                <h2>Rehabilitation Timeline</h2>

                <h3>Early Phase (While Immobilized)</h3>
                <p>Even while in a cast or brace, rehabilitation begins. Goals include maintaining circulation and reducing swelling (elevation, gentle pumping exercises), keeping joints above and below the fracture mobile, maintaining strength in unaffected limbs, and managing pain and swelling.</p>

                <h3>Post-Immobilization Phase (After Cast Removal)</h3>
                <p>This is when active rehabilitation intensifies. Your physiotherapist will guide you through gentle range-of-motion exercises to restore joint mobility, progressive strengthening as bone healing permits, scar tissue mobilization if surgery was performed, gradual weight-bearing progression, balance and proprioception training, and activities to rebuild function and confidence.</p>

                <h3>Return to Activity Phase</h3>
                <p>The final phase focuses on sport-specific or work-specific training, full strength and flexibility restoration, building endurance, and addressing any compensatory movement patterns developed during healing.</p>

                <h2>Common Fracture Rehabilitation Timelines</h2>

                <h3>Wrist Fracture (Distal Radius)</h3>
                <p>Cast/splint: 4-6 weeks. Physiotherapy: Begins immediately after immobilization removal. Full recovery: 3-6 months.</p>

                <h3>Ankle Fracture</h3>
                <p>Weight-bearing restrictions: 6-12 weeks depending on severity. Physiotherapy: Starts while non-weight-bearing with upper body and core work. Full recovery: 3-6 months for simple fractures, 6-12 months for complex.</p>

                <h3>Hip Fracture</h3>
                <p>Usually requires surgery. Physiotherapy: Begins within 24 hours of surgery with bed exercises. Walking: Often started within days using assistive devices. Full recovery: 6-12 months.</p>

                <h3>Vertebral Fracture</h3>
                <p>Treatment varies widely. Physiotherapy: Focuses on posture, core strengthening, and pain management. Recovery: Varies significantly based on fracture location and treatment.</p>

                <h2>Why Early Physiotherapy Matters</h2>
                <ul>
                    <li>Prevents excessive stiffness and muscle wasting</li>
                    <li>Reduces swelling and promotes circulation</li>
                    <li>Maintains function in unaffected areas</li>
                    <li>Speeds overall recovery time</li>
                    <li>Reduces risk of chronic pain and disability</li>
                </ul>

                <h2>Home Physiotherapy for Fracture Rehabilitation</h2>
                <p>For patients who cannot easily travel to a clinic—especially those with leg fractures—Dr. Aarthi Ganesh at Shree Physiotherapy Clinic provides home physiotherapy services throughout Coimbatore.</p>

                <p><strong>Start your fracture rehabilitation right.</strong> Contact Shree Physiotherapy Clinic at 9092294466 for expert fracture rehabilitation in Coimbatore.</p>
            `
        },
        // Fascial Manipulation
        {
            title: "What is Fascial Manipulation? A Complete Guide",
            category: "Fascial Therapy",
            icon: "fas fa-hand-sparkles",
            summary: "Understanding the revolutionary Italian technique that's transforming pain treatment.",
            readTime: "8 min",
            trending: true,
            image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80",
            fullContent: `
                <h2>Introduction to Fascial Manipulation</h2>
                <p>Fascial Manipulation is an advanced manual therapy technique developed by Italian physiotherapist Luigi Stecco over 40 years of clinical research. Unlike conventional treatments that focus on muscles, joints, or nerves in isolation, Fascial Manipulation targets the fascia—the interconnected network of connective tissue that surrounds and connects every structure in the body.</p>

                <p>Dr. Aarthi Ganesh at Shree Physiotherapy Clinic is one of the few physiotherapists in Coimbatore certified in Fascial Manipulation, having completed training directly through the Stecco method from Italy.</p>

                <h2>What is Fascia?</h2>
                <p>Fascia is the three-dimensional web of connective tissue that surrounds every muscle, bone, organ, nerve, and blood vessel in your body. Think of it as a continuous fabric that holds everything in place while allowing structures to slide smoothly against each other during movement.</p>

                <p>When fascia becomes restricted, thickened, or adhered due to injury, overuse, or prolonged postures, it can cause pain that seems to come from muscles, joints, or even nerves. This explains why many painful conditions don't respond to conventional treatments targeting these structures.</p>

                <h2>How Fascial Dysfunction Causes Pain</h2>
                <ul>
                    <li>Restricted fascia limits joint and muscle movement</li>
                    <li>Adhered layers increase friction and cause inflammation</li>
                    <li>Compensatory patterns develop, affecting other body areas</li>
                    <li>Free nerve endings in fascia become irritated</li>
                    <li>Referred pain patterns can mimic other conditions</li>
                </ul>

                <h2>How Fascial Manipulation Works</h2>
                <p>Fascial Manipulation involves identifying specific points on the fascia where restriction has developed (called Centers of Coordination and Centers of Fusion) and applying deep, sustained friction to these points. This friction generates heat and mechanical changes that restore the normal gliding properties of the fascia.</p>

                <p>The treatment is based on a detailed assessment of movement patterns and pain behavior, combined with palpation of the fascial system. The therapist creates a hypothesis about which fascial segments are involved and verifies this through the treatment response.</p>

                <h2>Conditions Treated with Fascial Manipulation</h2>

                <h3>Musculoskeletal Pain</h3>
                <ul>
                    <li>Back pain and sciatica</li>
                    <li>Neck pain and cervical spondylosis</li>
                    <li>Frozen shoulder and shoulder impingement</li>
                    <li>Tennis elbow and golfer's elbow</li>
                    <li>Knee pain and patellofemoral syndrome</li>
                    <li>Plantar fasciitis and heel pain</li>
                </ul>

                <h3>Internal Dysfunction</h3>
                <ul>
                    <li>Digestive problems (constipation, bloating)</li>
                    <li>Menstrual pain and pelvic pain</li>
                    <li>Breathing difficulties</li>
                    <li>Headaches and migraines</li>
                </ul>

                <h2>What to Expect During Treatment</h2>
                <p>A Fascial Manipulation session typically lasts 45-60 minutes. The therapist begins with a detailed assessment of your movement patterns, pain history, and any previous injuries or surgeries (as scars can affect the fascia). Palpation of specific points helps identify the fascial segments involved.</p>

                <p>Treatment involves deep pressure applied to specific points for several minutes each. This can be uncomfortable—the sensation often described as a "good hurt" that feels therapeutic. Redness and mild soreness at treatment points is normal and indicates the fascia is responding.</p>

                <h2>Results and Treatment Duration</h2>
                <p>Many patients experience immediate improvement in movement and pain reduction after the first session. Complex or chronic conditions may require 3-6 sessions. Unlike treatments that provide temporary relief, Fascial Manipulation addresses the underlying fascial dysfunction, leading to lasting results.</p>

                <h2>Why Choose Certified Fascial Manipulation</h2>
                <p>Fascial Manipulation requires extensive training to understand the complex fascial anatomy and apply the technique correctly. Dr. Aarthi Ganesh has completed certification in both Fascial Manipulation Level 1 and Level 2, ensuring patients receive authentic treatment based on the original Stecco method.</p>

                <h2>Fascial Manipulation at Shree Physiotherapy Clinic</h2>
                <p>As one of the few certified Fascial Manipulation practitioners in Coimbatore, Dr. Aarthi Ganesh has successfully treated hundreds of patients with chronic pain conditions that hadn't responded to conventional treatments. Many patients see significant improvement within 3-5 sessions.</p>

                <p><strong>Experience the difference of Fascial Manipulation.</strong> Contact Shree Physiotherapy Clinic at 9092294466 to book an assessment in Coimbatore.</p>
            `
        },
        // Posture & Ergonomics
        {
            title: "Perfect Workstation Setup for Pain Prevention",
            category: "Ergonomics",
            icon: "fas fa-desktop",
            summary: "How to set up your desk, chair, and computer to prevent work-related pain.",
            readTime: "5 min",
            trending: true,
            image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80",
            fullContent: `
                <h2>The Cost of Poor Ergonomics</h2>
                <p>The average office worker spends 8-10 hours a day at their desk. Poor workstation setup is a leading cause of neck pain, back pain, shoulder problems, carpal tunnel syndrome, and eye strain. These conditions develop gradually, making them easy to ignore until they become chronic problems.</p>

                <p>At Shree Physiotherapy Clinic, Dr. Aarthi Ganesh treats many patients whose pain originates from poor ergonomics. Often, simple workstation adjustments combined with targeted exercises can resolve long-standing issues.</p>

                <h2>Chair Setup</h2>

                <h3>Seat Height</h3>
                <p>Adjust your chair so your feet rest flat on the floor with thighs parallel to the ground. Your knees should be at a 90-degree angle. If your desk is too high to achieve this, use a footrest.</p>

                <h3>Seat Depth</h3>
                <p>Leave 2-3 finger widths between the front edge of the seat and the back of your knees. This prevents pressure on your thighs and allows proper circulation.</p>

                <h3>Lumbar Support</h3>
                <p>Your chair should support the natural curve of your lower back. If it doesn't, use a lumbar support cushion. The curve of your lower spine should be maintained, not flattened or exaggerated.</p>

                <h3>Armrests</h3>
                <p>Adjust armrests so your shoulders are relaxed and elbows rest at a 90-degree angle. Armrests that are too high cause shoulder tension; too low and they're useless.</p>

                <h2>Monitor Setup</h2>

                <h3>Height</h3>
                <p>The top of your monitor screen should be at or slightly below eye level. This prevents you from tilting your head up or down. If using a laptop, consider a laptop stand with an external keyboard and mouse.</p>

                <h3>Distance</h3>
                <p>Place your monitor at arm's length (about 50-70 cm away). You should be able to read text without leaning forward. Increase font size if needed rather than moving the monitor closer.</p>

                <h3>Position</h3>
                <p>Center the monitor directly in front of you. If you use dual monitors, position the primary monitor directly ahead and the secondary one at an angle. Don't work with a monitor to one side as this causes neck rotation.</p>

                <h3>Lighting</h3>
                <p>Position your monitor to avoid glare from windows or overhead lights. The monitor should be the brightest thing in your field of vision, but not excessively bright.</p>

                <h2>Keyboard and Mouse Setup</h2>

                <h3>Keyboard Position</h3>
                <p>Place your keyboard directly in front of you with the "B" key centered to your body. Your elbows should be bent at 90 degrees with forearms parallel to the floor. Avoid using the keyboard feet that tilt it upward—a flat or negative tilt is better for your wrists.</p>

                <h3>Mouse Position</h3>
                <p>Keep your mouse close to your keyboard, at the same level. Avoid reaching for it. Use your whole arm to move the mouse, not just your wrist.</p>

                <h3>Wrist Position</h3>
                <p>Keep wrists in a neutral position—not bent up, down, or to the side. A keyboard wrist rest can help, but use it while pausing, not while actively typing.</p>

                <h2>Document and Phone Placement</h2>
                <p>If you frequently reference documents, use a document holder placed next to or between your monitor and keyboard. Keep frequently used items within arm's reach. Use a headset for phone calls to avoid cradling the phone between ear and shoulder.</p>

                <h2>Movement is Essential</h2>
                <p>Even with perfect ergonomics, the human body isn't designed to stay still for hours. Follow the 20-20-20 rule: every 20 minutes, look at something 20 feet away for 20 seconds. Stand and move every 30-60 minutes. Consider a sit-stand desk to alternate positions throughout the day.</p>

                <h2>Ergonomic Assessments</h2>
                <p>For personalized ergonomic advice, especially if you're experiencing work-related pain, Dr. Aarthi Ganesh at Shree Physiotherapy Clinic can provide guidance on workstation setup along with treatment for existing problems.</p>

                <p><strong>Work pain-free.</strong> Contact Shree Physiotherapy Clinic at 9092294466 for ergonomic advice and treatment in Coimbatore.</p>
            `
        },
        {
            title: "Posture Correction: A Step-by-Step Guide",
            category: "Posture",
            icon: "fas fa-user",
            summary: "Daily habits and exercises to improve your posture and reduce pain.",
            readTime: "6 min",
            trending: false,
            image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80",
            fullContent: `
                <h2>Understanding Good Posture</h2>
                <p>Good posture isn't about standing rigidly straight like a soldier. It's about maintaining the natural curves of your spine in a balanced, efficient way that minimizes stress on your muscles and joints. When viewed from the side, a vertical line should pass through your ear, shoulder, hip, knee, and ankle.</p>

                <p>At Shree Physiotherapy Clinic, Dr. Aarthi Ganesh helps patients identify and correct postural imbalances that contribute to pain. Poor posture is often both a cause and consequence of musculoskeletal problems.</p>

                <h2>Common Postural Problems</h2>

                <h3>Forward Head Posture</h3>
                <p>The head juts forward beyond the shoulders, common in desk workers and smartphone users. For every inch your head moves forward, the effective weight on your neck increases by 10 pounds.</p>

                <h3>Rounded Shoulders</h3>
                <p>Shoulders roll forward, often accompanying forward head posture. This shortens the chest muscles and weakens the upper back muscles.</p>

                <h3>Kyphosis (Excessive Upper Back Curve)</h3>
                <p>An exaggerated rounding of the upper back, creating a hunched appearance. Common in elderly and those who sit for long periods.</p>

                <h3>Lordosis (Excessive Lower Back Curve)</h3>
                <p>An exaggerated inward curve of the lower back, often accompanied by a protruding belly and tilted pelvis.</p>

                <h3>Sway Back</h3>
                <p>Hips push forward while upper body leans back, creating an "S" shaped curve when viewed from the side.</p>

                <h2>Exercises for Posture Correction</h2>

                <h3>For Forward Head Posture</h3>
                <p><strong>Chin Tucks:</strong> Sit or stand tall. Gently draw your chin straight back, creating a "double chin." Hold for 5 seconds, repeat 10 times. This strengthens the deep neck flexors.</p>

                <h3>For Rounded Shoulders</h3>
                <p><strong>Doorway Stretch:</strong> Stand in a doorway with arms at 90 degrees on the door frame. Step forward to stretch the chest. Hold 30 seconds. This opens the chest and stretches tight pectorals.</p>
                <p><strong>Wall Angels:</strong> Stand with back against a wall, arms in "goalpost" position. Slowly slide arms up and down the wall while keeping contact. Repeat 10 times. This strengthens the upper back muscles.</p>

                <h3>For Excessive Kyphosis</h3>
                <p><strong>Thoracic Extension:</strong> Sit on a chair and place hands behind head. Gently arch your upper back over the chair back. Hold 5 seconds, repeat 10 times. This mobilizes the thoracic spine.</p>
                <p><strong>Prone Y-Raises:</strong> Lie face down with arms forming a "Y" shape. Raise arms toward the ceiling while squeezing shoulder blades together. Hold 3 seconds, lower slowly. Repeat 15 times.</p>

                <h3>For Excessive Lordosis</h3>
                <p><strong>Pelvic Tilts:</strong> Lie on your back with knees bent. Flatten your lower back against the floor by tilting your pelvis. Hold 5 seconds, release. Repeat 15-20 times.</p>
                <p><strong>Hip Flexor Stretch:</strong> Kneel on one knee with the other foot in front. Push hips forward until you feel a stretch in the front of the back hip. Hold 30 seconds per side.</p>

                <h2>Daily Habits for Better Posture</h2>
                <ul>
                    <li><strong>Set reminders:</strong> Every 30 minutes, check and correct your posture.</li>
                    <li><strong>Use visual cues:</strong> Place sticky notes at your desk or set phone backgrounds to remind you.</li>
                    <li><strong>Strengthen your core:</strong> A strong core supports good posture automatically.</li>
                    <li><strong>Check your workstation:</strong> Adjust chair, monitor, and keyboard heights.</li>
                    <li><strong>Vary your position:</strong> Alternate between sitting and standing throughout the day.</li>
                    <li><strong>Be aware during activities:</strong> Notice your posture while driving, watching TV, using your phone.</li>
                    <li><strong>Choose supportive shoes:</strong> High heels and flat shoes without arch support affect posture.</li>
                </ul>

                <h2>How Long Does Posture Correction Take?</h2>
                <p>Changing ingrained postural habits takes time—typically 3-6 months of consistent effort. Initially, good posture may feel awkward or tiring because weakened muscles are being challenged. Persist through this phase; as muscles strengthen, good posture becomes natural and effortless.</p>

                <h2>When to Seek Professional Help</h2>
                <p>If you have persistent pain, structural issues like scoliosis, or difficulty maintaining good posture despite exercises, consult a physiotherapist. Dr. Aarthi Ganesh at Shree Physiotherapy Clinic provides comprehensive postural assessment and individualized correction programs.</p>

                <p><strong>Stand tall, live well.</strong> Contact Shree Physiotherapy Clinic at 9092294466 for postural assessment and correction in Coimbatore.</p>
            `
        }
    ];

    // Pick articles for today (consistent throughout the day)
    function getTodaysArticles(count) {
        const seed = getDaySeed();
        const shuffled = [...TRENDING_ARTICLES];

        // Shuffle using seeded random
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(seededRandom(seed + i) * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }

        // Prioritize trending articles
        shuffled.sort((a, b) => (b.trending ? 1 : 0) - (a.trending ? 1 : 0));

        return shuffled.slice(0, count);
    }

    // Create Article Modal
    function createArticleModal() {
        if (document.getElementById('articleModal')) return;

        const modal = document.createElement('div');
        modal.id = 'articleModal';
        modal.className = 'article-modal';
        modal.innerHTML = `
            <div class="article-modal-overlay"></div>
            <div class="article-modal-container">
                <button class="article-modal-close" aria-label="Close article"><i class="fas fa-times"></i></button>
                <div class="article-modal-content">
                    <div class="article-modal-header">
                        <img class="article-modal-image" src="" alt="">
                        <div class="article-modal-meta">
                            <span class="article-modal-category"></span>
                            <span class="article-modal-readtime"></span>
                        </div>
                    </div>
                    <h1 class="article-modal-title"></h1>
                    <div class="article-modal-body"></div>
                    <div class="article-modal-footer">
                        <div class="article-modal-author">
                            <img src="a1.jpg" alt="Dr. Aarthi Ganesh" class="author-image">
                            <div class="author-info">
                                <strong>Dr. Aarthi Ganesh</strong>
                                <span>Gold Medalist Physiotherapist | Italy-certified Fascial Manipulation Specialist</span>
                            </div>
                        </div>
                        <div class="article-modal-cta">
                            <a href="book.html" class="btn btn-primary"><i class="fas fa-calendar-check"></i> Book Appointment</a>
                            <a href="tel:9092294466" class="btn btn-outline"><i class="fas fa-phone"></i> Call: 9092294466</a>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        // Close modal events
        modal.querySelector('.article-modal-overlay').addEventListener('click', closeArticleModal);
        modal.querySelector('.article-modal-close').addEventListener('click', closeArticleModal);

        // Close on escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && modal.classList.contains('active')) {
                closeArticleModal();
            }
        });
    }

    // Open article modal
    function openArticleModal(article) {
        const modal = document.getElementById('articleModal');
        if (!modal) return;

        // Use dynamic category-based image
        const articleImage = getCategoryImage(article.category) || article.image;
        modal.querySelector('.article-modal-image').src = articleImage;
        modal.querySelector('.article-modal-image').alt = article.title;
        modal.querySelector('.article-modal-category').textContent = article.category;
        modal.querySelector('.article-modal-readtime').innerHTML = `<i class="fas fa-clock"></i> ${article.readTime} read`;
        modal.querySelector('.article-modal-title').textContent = article.title;
        modal.querySelector('.article-modal-body').innerHTML = article.fullContent;

        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    // Close article modal
    function closeArticleModal() {
        const modal = document.getElementById('articleModal');
        if (!modal) return;

        modal.classList.remove('active');
        document.body.style.overflow = '';
    }

    // Render trending articles
    function renderTrendingArticles() {
        const container = document.getElementById('trendingArticles');
        if (!container) return;

        const articles = getTodaysArticles(6);

        container.innerHTML = articles.map((article, index) => {
            const isNew = index < 2;
            // Use dynamic category-based image that rotates daily
            const articleImage = getCategoryImage(article.category) || article.image;

            return `
                <article class="trending-card fade-in" data-article-index="${index}">
                    <div class="trending-image">
                        <img src="${articleImage}" alt="${article.title}" loading="lazy">
                    </div>
                    <div class="trending-content">
                        <div class="trending-meta">
                            <span class="trending-category">${article.category}</span>
                            ${isNew ? '<span class="trending-new">New Today</span>' : ''}
                        </div>
                        <h3>${article.title}</h3>
                        <p>${article.summary}</p>
                        <div class="trending-footer">
                            <span class="read-time"><i class="fas fa-clock"></i> ${article.readTime}</span>
                            <button class="learn-more-btn" data-article-index="${index}">Learn More <i class="fas fa-arrow-right"></i></button>
                        </div>
                    </div>
                </article>
            `;
        }).join('');

        // Add click handlers for Learn More buttons
        container.querySelectorAll('.learn-more-btn').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                const index = parseInt(this.dataset.articleIndex);
                openArticleModal(articles[index]);
            });
        });

        // Also make the card clickable
        container.querySelectorAll('.trending-card').forEach(card => {
            card.addEventListener('click', function(e) {
                if (e.target.closest('.learn-more-btn')) return; // Don't double-trigger
                const index = parseInt(this.dataset.articleIndex);
                openArticleModal(articles[index]);
            });
            card.style.cursor = 'pointer';
        });

        // Trigger animations
        setTimeout(() => {
            container.querySelectorAll('.fade-in').forEach((el, i) => {
                setTimeout(() => el.classList.add('visible'), i * 100);
            });
        }, 100);
    }

    // Initialize Charts
    function initCharts() {
        // Conditions Chart (Pie/Doughnut)
        const conditionsCtx = document.getElementById('conditionsChart');
        if (conditionsCtx) {
            new Chart(conditionsCtx, {
                type: 'doughnut',
                data: {
                    labels: ['Back Pain', 'Neck Pain', 'Knee Pain', 'Shoulder Pain', 'Sports Injuries', 'Others'],
                    datasets: [{
                        data: [30, 20, 18, 15, 10, 7],
                        backgroundColor: [
                            '#1B4D3E',
                            '#2D7A5F',
                            '#C8956C',
                            '#4A9B7F',
                            '#E8D5C0',
                            '#6B7280'
                        ],
                        borderWidth: 0,
                        hoverOffset: 10
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                padding: 20,
                                usePointStyle: true,
                                font: {
                                    family: "'Inter', sans-serif",
                                    size: 12
                                }
                            }
                        }
                    },
                    cutout: '60%'
                }
            });
        }

        // Recovery Timeline Chart (Bar)
        const recoveryCtx = document.getElementById('recoveryChart');
        if (recoveryCtx) {
            new Chart(recoveryCtx, {
                type: 'bar',
                data: {
                    labels: ['Back Pain', 'Neck Pain', 'Knee Pain', 'Frozen Shoulder', 'Sports Injury', 'Post-Surgery'],
                    datasets: [{
                        label: 'Average Sessions',
                        data: [5, 7, 10, 15, 8, 12],
                        backgroundColor: [
                            'rgba(27, 77, 62, 0.8)',
                            'rgba(45, 122, 95, 0.8)',
                            'rgba(200, 149, 108, 0.8)',
                            'rgba(74, 155, 127, 0.8)',
                            'rgba(232, 213, 192, 0.8)',
                            'rgba(107, 114, 128, 0.8)'
                        ],
                        borderRadius: 8,
                        borderSkipped: false
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 20,
                            ticks: {
                                stepSize: 5,
                                font: {
                                    family: "'Inter', sans-serif"
                                }
                            },
                            grid: {
                                color: 'rgba(0,0,0,0.05)'
                            }
                        },
                        x: {
                            ticks: {
                                font: {
                                    family: "'Inter', sans-serif",
                                    size: 11
                                }
                            },
                            grid: {
                                display: false
                            }
                        }
                    }
                }
            });
        }
    }

    // Animate stat numbers
    function animateStats() {
        const statNumbers = document.querySelectorAll('.stat-number[data-count]');

        statNumbers.forEach(stat => {
            const target = parseInt(stat.dataset.count);
            const duration = 2000;
            const start = 0;
            const startTime = performance.now();

            function update(currentTime) {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const easeOut = 1 - Math.pow(1 - progress, 3);
                const current = Math.floor(start + (target - start) * easeOut);

                stat.textContent = current.toLocaleString();

                if (progress < 1) {
                    requestAnimationFrame(update);
                } else {
                    stat.textContent = target.toLocaleString() + '+';
                }
            }

            // Start animation when visible
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        requestAnimationFrame(update);
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.5 });

            observer.observe(stat);
        });
    }

    // Initialize fade-in animations
    function initAnimations() {
        const fadeElements = document.querySelectorAll('.fade-in:not(.visible)');

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

        fadeElements.forEach(el => observer.observe(el));
    }

    // Create slug from title
    function createSlug(title) {
        return (title || '').toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .substring(0, 60);
    }

    // Find article by slug or keyword matching
    function findArticleBySlug(slug) {
        if (!slug) return null;

        const searchSlug = slug.toLowerCase();

        // First try exact slug match
        for (const article of TRENDING_ARTICLES) {
            if (createSlug(article.title) === searchSlug) {
                return article;
            }
        }

        // Try keyword matching for articles from homepage
        const keywords = searchSlug.split('-').filter(w => w.length > 3);
        let bestMatch = null;
        let bestScore = 0;

        for (const article of TRENDING_ARTICLES) {
            const titleLower = article.title.toLowerCase();
            const categoryLower = article.category.toLowerCase();
            let score = 0;

            for (const keyword of keywords) {
                if (titleLower.includes(keyword)) score += 2;
                if (categoryLower.includes(keyword)) score += 1;
            }

            // Check for common topic matches
            if (searchSlug.includes('back') && (titleLower.includes('back') || categoryLower.includes('back'))) score += 3;
            if (searchSlug.includes('neck') && (titleLower.includes('neck') || categoryLower.includes('neck'))) score += 3;
            if (searchSlug.includes('shoulder') && (titleLower.includes('shoulder') || categoryLower.includes('frozen'))) score += 3;
            if (searchSlug.includes('knee') && titleLower.includes('knee')) score += 3;
            if (searchSlug.includes('sciatica') && titleLower.includes('sciatica')) score += 3;
            if (searchSlug.includes('fascial') && titleLower.includes('fascial')) score += 3;
            if (searchSlug.includes('women') && categoryLower.includes('women')) score += 3;
            if (searchSlug.includes('prenatal') && titleLower.includes('pregnancy')) score += 3;
            if (searchSlug.includes('pelvic') && titleLower.includes('pelvic')) score += 3;
            if (searchSlug.includes('elderly') && categoryLower.includes('elderly')) score += 3;
            if (searchSlug.includes('senior') && categoryLower.includes('elderly')) score += 3;
            if (searchSlug.includes('fall') && titleLower.includes('fall')) score += 3;
            if (searchSlug.includes('stroke') && titleLower.includes('stroke')) score += 3;
            if (searchSlug.includes('posture') && titleLower.includes('posture')) score += 3;
            if (searchSlug.includes('ergonomic') && titleLower.includes('workstation')) score += 3;
            if (searchSlug.includes('sports') && categoryLower.includes('sports')) score += 3;
            if (searchSlug.includes('acl') && titleLower.includes('acl')) score += 3;
            if (searchSlug.includes('fracture') && titleLower.includes('fracture')) score += 3;
            if (searchSlug.includes('surgery') && titleLower.includes('surgery')) score += 3;
            if (searchSlug.includes('rehabilitation') && categoryLower.includes('rehab')) score += 3;
            if (searchSlug.includes('arthritis') && titleLower.includes('arthritis')) score += 3;

            if (score > bestScore) {
                bestScore = score;
                bestMatch = article;
            }
        }

        // Return best match if score is good enough
        return bestScore >= 2 ? bestMatch : TRENDING_ARTICLES[0]; // Default to first article
    }

    // Check URL for article parameter and open modal
    function checkUrlForArticle() {
        const urlParams = new URLSearchParams(window.location.search);
        const articleSlug = urlParams.get('article');

        if (articleSlug) {
            const article = findArticleBySlug(decodeURIComponent(articleSlug));
            if (article) {
                // Small delay to ensure modal is created
                setTimeout(() => {
                    openArticleModal(article);
                    // Scroll to trending section
                    const trendingSection = document.querySelector('.trending-section');
                    if (trendingSection) {
                        trendingSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                }, 300);
            }
        }
    }

    // Dynamic patient count based on dashboard data
    function getDynamicPatientCount() {
        let baseCount = 1500;
        let additionalCount = 0;

        try {
            // Get patients from localStorage (added via dashboard)
            const patients = JSON.parse(localStorage.getItem('patients') || '[]');
            additionalCount += patients.length;

            // Add daily organic increment based on date
            const startDate = new Date('2024-01-01');
            const today = new Date();
            const daysSinceStart = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));
            const dailyGrowth = Math.floor(daysSinceStart * 0.5);

            additionalCount += dailyGrowth;
        } catch (e) {
            // If localStorage fails, just use base count
        }

        return baseCount + additionalCount;
    }

    // Update patient count on page
    function updatePatientCount() {
        const patientCounter = document.getElementById('blogPatientCount');
        if (patientCounter) {
            const dynamicCount = getDynamicPatientCount();
            patientCounter.setAttribute('data-count', dynamicCount);
        }
    }

    // SEO Keywords for daily rotation - helps with organic search
    const SEO_KEYWORDS = {
        'Back Pain': 'back pain treatment Coimbatore, lower back pain relief, sciatica treatment, spine physiotherapy, lumbar pain cure',
        'Neck Pain': 'neck pain treatment Coimbatore, cervical pain relief, neck stiffness cure, cervical spondylosis treatment',
        'Knee Pain': 'knee pain treatment Coimbatore, knee joint pain relief, arthritis treatment, knee physiotherapy',
        'Shoulder Pain': 'shoulder pain treatment Coimbatore, frozen shoulder cure, rotator cuff treatment, shoulder physiotherapy',
        "Women's Health": 'womens health physiotherapy Coimbatore, prenatal care, postnatal physiotherapy, pelvic floor therapy',
        'Elderly Care': 'elderly physiotherapy Coimbatore, home visit physio, senior citizen care, geriatric physiotherapy',
        'Exercise': 'sports physiotherapy Coimbatore, exercise therapy, fitness rehabilitation, sports injury treatment',
        'Posture': 'posture correction Coimbatore, ergonomic therapy, desk worker physiotherapy, spinal alignment'
    };

    // Update page meta tags for SEO
    function updatePageSEO() {
        const today = new Date();
        const dateStr = today.toISOString().split('T')[0];

        // Update meta description with today's date for freshness
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) {
            metaDesc.setAttribute('content',
                `Latest physiotherapy health tips and exercises from Dr. Aarthi Ganesh, Coimbatore. Updated ${dateStr}. Expert advice on back pain, neck pain, knee pain, and rehabilitation. Book appointment: 9092294466`
            );
        }

        // Add/update article structured data for SEO
        let schemaScript = document.getElementById('blog-schema');
        if (!schemaScript) {
            schemaScript = document.createElement('script');
            schemaScript.id = 'blog-schema';
            schemaScript.type = 'application/ld+json';
            document.head.appendChild(schemaScript);
        }

        const articles = getTodaysArticles(6);
        const articleSchema = {
            "@context": "https://schema.org",
            "@type": "Blog",
            "name": "Shree Physiotherapy Health Blog",
            "description": "Expert physiotherapy tips, exercises, and health advice from Dr. Aarthi Ganesh",
            "url": "https://www.shreephysiotherapy.com/blog.html",
            "author": {
                "@type": "Person",
                "name": "Dr. Aarthi Ganesh",
                "jobTitle": "Gold Medalist Physiotherapist"
            },
            "publisher": {
                "@type": "Organization",
                "name": "Shree Physiotherapy Clinic",
                "address": {
                    "@type": "PostalAddress",
                    "addressLocality": "Coimbatore",
                    "addressRegion": "Tamil Nadu",
                    "addressCountry": "India"
                }
            },
            "blogPost": articles.slice(0, 3).map(article => ({
                "@type": "BlogPosting",
                "headline": article.title,
                "description": article.summary,
                "datePublished": dateStr,
                "dateModified": dateStr,
                "author": {
                    "@type": "Person",
                    "name": "Dr. Aarthi Ganesh"
                },
                "keywords": SEO_KEYWORDS[article.category] || "physiotherapy Coimbatore"
            }))
        };

        schemaScript.textContent = JSON.stringify(articleSchema);
    }

    // Initialize on DOM ready
    document.addEventListener('DOMContentLoaded', function() {
        updatePatientCount();
        createArticleModal();
        renderTrendingArticles();
        initCharts();
        animateStats();
        initAnimations();
        updatePageSEO(); // Add SEO improvements

        // Check URL for article parameter to open from homepage links
        checkUrlForArticle();
    });

})();
