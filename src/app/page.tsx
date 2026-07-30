"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import AOS from "aos";
import "aos/dist/aos.css";

const HeroThreeScene = dynamic(() => import("./HeroThreeScene"), {
  ssr: false,
});

export default function Home() {
  const menuBtnRef = useRef<HTMLButtonElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const [activeSection, setActiveSection] = useState("home");

  useEffect(() => {
    AOS.init({ duration: 700, once: true, offset: 80 });
  }, []);

  useEffect(() => {
    const menuBtn = menuBtnRef.current;
    const mobileMenu = mobileMenuRef.current;
    if (!menuBtn || !mobileMenu) return;
    const toggle = () => mobileMenu.classList.toggle("hidden");
    menuBtn.addEventListener("click", toggle);
    return () => menuBtn.removeEventListener("click", toggle);
  }, []);

  useEffect(() => {
    const handleAnchorClick = (e: Event) => {
      const target = e.target as HTMLAnchorElement;
      if (target.hash && target.hash !== "#") {
        e.preventDefault();
        const el = document.querySelector(target.hash);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
          mobileMenuRef.current?.classList.add("hidden");
        }
      }
    };
    document.querySelectorAll('a[href^="#"]').forEach((a) =>
      a.addEventListener("click", handleAnchorClick)
    );
    return () => {
      document.querySelectorAll('a[href^="#"]').forEach((a) =>
        a.removeEventListener("click", handleAnchorClick)
      );
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const nav = navRef.current;
      if (nav) {
        if (window.scrollY > 30) nav.classList.add("shadow-sm", "bg-white/100", "dark:bg-gray-900/100");
        else nav.classList.remove("shadow-sm", "bg-white/100", "dark:bg-gray-900/100");
      }
      const sections = document.querySelectorAll("section");
      let current = "home";
      sections.forEach((sec) => {
        const top = sec.offsetTop - 150;
        if (window.scrollY >= top) current = sec.id;
      });
      setActiveSection(current);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navClass = (id: string) =>
    `nav-link font-semibold transition ${activeSection === id
      ? "text-blue-600 dark:text-blue-400"
      : "text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
    }`;

  return (
    <>
      {/* WhatsApp */}
      <a
        href="https://wa.me/919168823775?text=Hi%20Hitesh,%20I'm%20interested%20in%20hiring%20you"
        className="whatsapp-float"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
      >
        <i className="fab fa-whatsapp"></i>
      </a>

      {/* Navigation */}
      <nav
        ref={navRef}
        className="fixed top-0 left-0 w-full bg-white/95 dark:bg-gray-900/95 backdrop-blur-md z-50 border-b border-gray-100 dark:border-gray-700 transition-all duration-300"
      >
        <div className="max-w-7xl mx-auto px-6 md:px-8 py-4 flex items-center justify-between">
          <a href="#home" className="text-2xl font-extrabold tracking-tight gradient-text">
            Hitesh Ahire
          </a>
          <div className="hidden md:flex space-x-8">
            <a href="#about" className={navClass("about")}>About</a>
            <a href="#experience" className={navClass("experience")}>Experience</a>
            <a href="#skills" className={navClass("skills")}>Skills</a>
            <a href="#projects" className={navClass("projects")}>Projects</a>
            <a href="#education" className={navClass("education")}>Education</a>
            <a href="#blogs" className={navClass("blogs")}>Blogs</a>
            <a href="#contact" className={navClass("contact")}>Contact</a>
          </div>
          <button ref={menuBtnRef} className="md:hidden text-gray-700 dark:text-gray-300 text-2xl focus:outline-none">
            <i className="fas fa-bars"></i>
          </button>
        </div>
        <div
          ref={mobileMenuRef}
          className="hidden md:hidden bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-700 py-4 px-6 flex flex-col space-y-4 shadow-lg"
        >
          <a href="#home" className="mobile-nav-link text-gray-700 dark:text-gray-300 font-medium hover:text-blue-600">Home</a>
          <a href="#about" className="mobile-nav-link text-gray-700 dark:text-gray-300 font-medium hover:text-blue-600">About</a>
          <a href="#experience" className="mobile-nav-link text-gray-700 dark:text-gray-300 font-medium hover:text-blue-600">Experience</a>
          <a href="#skills" className="mobile-nav-link text-gray-700 dark:text-gray-300 font-medium hover:text-blue-600">Skills</a>
          <a href="#projects" className="mobile-nav-link text-gray-700 dark:text-gray-300 font-medium hover:text-blue-600">Projects</a>
          <a href="#education" className="mobile-nav-link text-gray-700 dark:text-gray-300 font-medium hover:text-blue-600">Education</a>
          <a href="#blogs" className="mobile-nav-link text-gray-700 dark:text-gray-300 font-medium hover:text-blue-600">Blogs</a>
          <a href="#contact" className="mobile-nav-link text-gray-700 dark:text-gray-300 font-medium hover:text-blue-600">Contact</a>
        </div>
      </nav>

      {/* Hero */}
      <section id="home" className="pt-32 pb-20 md:pt-40 md:pb-28 bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800">
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1 text-center lg:text-left" data-aos="fade-up">
              <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-900/30 rounded-full px-4 py-1.5 text-blue-700 dark:text-blue-300 text-sm font-semibold mb-6">
                <i className="fas fa-code"></i> Full Stack Developer
              </div>
              <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-gray-900 dark:text-white leading-tight">
                Hitesh Ahire
              </h1>
              <div className="text-2xl md:text-3xl font-semibold mt-3 text-gray-800 dark:text-gray-200">
                <span className="gradient-text">Next.js • NestJS • Laravel</span> Expert
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-lg mt-5 max-w-xl mx-auto lg:mx-0">
                Building scalable web applications & enterprise solutions with 4 years of experience. 20+ live projects delivered for government, matrimony, and CRM platforms.
              </p>
              <div className="flex flex-wrap gap-4 justify-center lg:justify-start mt-8">
                <a href="#contact" className="gradient-bg text-white px-7 py-3 rounded-full font-semibold shadow-md hover:shadow-lg transition-all hover:-translate-y-1">
                  Hire Me <i className="fas fa-arrow-right ml-2"></i>
                </a>
                <a href="#projects" className="border border-blue-600 dark:border-blue-400 text-blue-700 dark:text-blue-300 px-7 py-3 rounded-full font-semibold hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-all">
                  View Projects
                </a>
              </div>
            </div>
            <div className="flex-1 flex justify-center" data-aos="fade-left">
              <div className="relative w-72 h-72 md:w-80 md:h-80 rounded-3xl shadow-xl overflow-hidden bg-gradient-to-tr from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30">
                <HeroThreeScene />
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-blue-500/5 via-transparent to-indigo-500/5 dark:from-blue-500/10 dark:to-indigo-500/10 rounded-3xl" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <div className="text-center mb-12" data-aos="fade-up">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">About Me</h2>
            <div className="w-16 h-1 gradient-bg mx-auto mt-3 rounded-full"></div>
          </div>
          <div className="flex flex-col lg:flex-row gap-12 items-center">
            <div className="lg:w-5/12" data-aos="fade-right">
              <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-2 shadow-md">
                <div className="bg-white dark:bg-gray-700 rounded-xl p-6 text-center">
                  <i className="fas fa-user-astronaut text-5xl gradient-text mb-3"></i>
                  <h3 className="font-bold text-xl text-gray-900 dark:text-white">Hitesh Ahire</h3>
                  <p className="text-gray-500 dark:text-gray-400">Full Stack Developer (India)</p>
                  <div className="flex justify-center gap-4 mt-4">
                    <span className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm px-3 py-1 rounded-full">Next.js</span>
                    <span className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm px-3 py-1 rounded-full">NestJS</span>
                    <span className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm px-3 py-1 rounded-full">Laravel</span>
                  </div>
                  <div className="mt-4 flex justify-center gap-3 text-gray-600 dark:text-gray-400">
                    <span><i className="fas fa-language text-blue-500"></i> English, Hindi, Marathi</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="lg:w-7/12" data-aos="fade-left">
              <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
                I'm <strong className="text-blue-600 dark:text-blue-400">Hitesh Ahire</strong>, a passionate full-stack software developer based in Nashik, Maharashtra.
                With 4 years of hands-on experience, I specialize in crafting high-performance web applications for enterprises, matrimony platforms, CRM systems, and government projects like the NMC Water Tax System.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                  <i className="fas fa-map-marker-alt text-blue-600 dark:text-blue-400"></i><span>Nashik, Maharashtra (India)</span>
                </div>
                <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                  <i className="fas fa-laptop-code text-blue-600 dark:text-blue-400"></i><span>20+ Projects Deployed</span>
                </div>
                <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                  <i className="fas fa-trophy text-blue-600 dark:text-blue-400"></i><span>Top Rated Developer</span>
                </div>
                <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                  <i className="fas fa-globe text-blue-600 dark:text-blue-400"></i><span>Clients across India</span>
                </div>
                <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                  <i className="fas fa-graduation-cap text-blue-600 dark:text-blue-400"></i><span>MSc Computer Science</span>
                </div>
                <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                  <i className="fas fa-certificate text-blue-600 dark:text-blue-400"></i><span>Full Stack Laravel & Java Certified</span>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mt-5">
                Leading development at DMS Genix for large-scale matrimony platforms (96 Kuli Maratha, Jain Matrimony Bureau), previously led team at Nullplex for NMC Water Tax System. Expert in modern full-stack ecosystems, clean code, and scalable architecture. I also run a tech blog at SustainixSH sharing insights on AI, PHP, Next.js and modern web practices.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Experience */}
      <section id="experience" className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <div className="text-center mb-12" data-aos="fade-up">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">Work Experience</h2>
            <div className="w-16 h-1 gradient-bg mx-auto mt-3 rounded-full"></div>
          </div>
          <div className="space-y-6 max-w-4xl mx-auto">
            {[
              {
                title: "Full Stack Software Developer",
                date: "Dec 2025 – Present",
                company: "DMS Genix, Nashik",
                points: [
                  "Building high-scale matrimony platforms using Next.js, NestJS, React, Laravel.",
                  "Optimized SSR performance, implemented microservices.",
                  "Integrated real-time chat, secure authentication, and advanced matchmaking algorithms.",
                ],
              },
              {
                title: "Project Team Lead",
                date: "Sept 2024 – Dec 2025",
                company: "Nullplex Software, Nashik",
                points: [
                  "Led Laravel & Vue.js team for NMC Water Tax System.",
                  "Built Lantern CRM and Asset Tracker.",
                  "Integrated payment gateways, ensured timely delivery with agile methodology.",
                ],
              },
              {
                title: "Web Developer",
                date: "Mar 2023 – Aug 2024",
                company: "Aspire Webs, Nashik",
                points: [
                  "Developed full-stack applications using Laravel, Vue.js, React, Tailwind, MySQL.",
                  "Enhanced performance by 30% through code optimization and database indexing.",
                ],
              },
              {
                title: "Full Stack Java Developer Intern",
                date: "Jan 2022 – Jul 2022",
                company: "Naresh IT, Ameerpet",
                points: [
                  "Intensive training: Java, Servlet, JDBC, JSP; built School Management System.",
                  "Hands-on with core backend & frontend integration.",
                ],
              },
            ].map((job, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-gray-700 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-600 timeline-card"
                data-aos="fade-up"
              >
                <div className="flex flex-wrap justify-between items-start gap-2 mb-2">
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white">{job.title}</h3>
                  <span className="text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full">{job.date}</span>
                </div>
                <p className="text-blue-600 dark:text-blue-400 font-medium">{job.company}</p>
                <ul className="mt-3 space-y-1 text-gray-600 dark:text-gray-300 list-disc list-inside">
                  {job.points.map((p, i) => (
                    <li key={i}>{p}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Skills */}
      <section id="skills" className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <div className="text-center mb-12" data-aos="fade-up">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">Technical Arsenal</h2>
            <div className="w-16 h-1 gradient-bg mx-auto mt-3 rounded-full"></div>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { icon: "fab fa-react", title: "Frontend", items: ["Next.js 14+ / React", "Vue.js / Vuex", "Tailwind / Bootstrap", "TypeScript / JavaScript ES6+"] },
              { icon: "fas fa-server", title: "Backend", items: ["NestJS / Node.js", "Laravel (PHP)", "RESTful APIs / GraphQL", "Java / Servlet / JSP"] },
              { icon: "fas fa-database", title: "DB & Cloud", items: ["PhpMyAdmin / MySQL / Oracle", "AWS S3 / Git / GitLab", "cPanel / WHM / HPanel", "Firebase / JWT / 2FA"] },
              { icon: "fas fa-credit-card", title: "Integrations", items: ["Payment Gateways", "Multilingual (i18n)", "WHMCS API", "Real-time Chat / Socket.io"] },
            ].map((skill, idx) => (
              <div key={idx} className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-5 text-center hover:shadow-md transition" data-aos="zoom-in" data-aos-delay={idx * 100}>
                <i className={`${skill.icon} text-3xl skill-icon mb-2`}></i>
                <h3 className="font-bold text-lg mb-2 text-gray-900 dark:text-white">{skill.title}</h3>
                <ul className="text-gray-600 dark:text-gray-300 text-sm space-y-1">
                  {skill.items.map((item, i) => <li key={i}>{item}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Projects */}
      <section id="projects" className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <div className="text-center mb-12" data-aos="fade-up">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">Live Projects & Innovations</h2>
            <div className="w-16 h-1 gradient-bg mx-auto mt-3 rounded-full"></div>
            <p className="text-gray-500 dark:text-gray-400 mt-4">Enterprise-grade solutions | 20+ successful deliveries</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: "fas fa-water fa-4x text-blue-600", title: "NMC Water Tax System", desc: "Smart city billing with QFix & multilingual.", tags: ["Laravel", "MySQL", "QFix"], link: null },
              { icon: "fas fa-heart fa-4x text-rose-500", title: "96 Kuli Maratha Matrimony", desc: "Advanced matchmaking, chat, search.", tags: ["Next.js", "NestJS"], link: "https://96kulimarathamarriage.com/" },
              { icon: "fas fa-hand-peace fa-4x text-purple-600", title: "Jain Matrimony Bureau", desc: "Premium real-time features.", tags: ["React", "Laravel"], link: "https://jainmatrimonybureau.com/" },
              { icon: "fas fa-tools fa-4x text-emerald-600", title: "MechManager", desc: "Workshop & vehicle management.", tags: ["Laravel", "MySQL"], link: "https://www.mechmanager.com/" },
              { icon: "fas fa-chalkboard-user fa-4x text-slate-600", title: "Lantern CRM", desc: "Enterprise CRM with dynamic ticketing.", tags: ["Laravel", "Vue.js"], link: null },
              { icon: "fas fa-cloud-upload-alt fa-4x text-cyan-600", title: "CloudCareHost", desc: "Hosting platform with WHM/cPanel.", tags: ["Laravel", "WHMCS API"], link: "https://cloudcarehost.com/" },
            ].map((project, idx) => (
              <div key={idx} className="bg-white dark:bg-gray-700 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all hover:-translate-y-1 border border-gray-100 dark:border-gray-600" data-aos="fade-up">
                <div className="h-36 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 flex items-center justify-center">
                  <i className={project.icon}></i>
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-xl text-gray-900 dark:text-white">{project.title}</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{project.desc}</p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {project.tags.map((tag, i) => (
                      <span key={i} className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs px-3 py-1 rounded-full">{tag}</span>
                    ))}
                  </div>
                  {project.link && (
                    <a href={project.link} target="_blank" className="inline-block mt-3 text-blue-600 dark:text-blue-400 text-sm font-semibold">Visit Live →</a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Education */}
      <section id="education" className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <div className="text-center mb-12" data-aos="fade-up">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">Education & Certifications</h2>
            <div className="w-16 h-1 gradient-bg mx-auto mt-3 rounded-full"></div>
          </div>
          <div className="flex flex-col lg:flex-row gap-8 justify-center">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-6 w-full lg:w-5/12" data-aos="fade-right">
              <i className="fas fa-university text-3xl text-blue-600 dark:text-blue-400 mb-3"></i>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Master of Science (Computer Science)</h3>
              <p className="text-gray-700 dark:text-gray-300">G.D. Sawant College, Nashik | June 2021 – April 2023</p>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">Advanced coursework in distributed systems, software architecture.</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-6 w-full lg:w-5/12" data-aos="fade-left">
              <i className="fas fa-graduation-cap text-3xl text-blue-600 dark:text-blue-400 mb-3"></i>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Bachelor of Science (Computer Science)</h3>
              <p className="text-gray-700 dark:text-gray-300">K.T.H.M. College, Nashik | June 2017 – April 2021</p>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">Foundation in programming, web development, databases.</p>
            </div>
          </div>
          <div className="mt-8 text-center" data-aos="fade-up">
            <div className="inline-flex flex-wrap gap-3 justify-center">
              <span className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-4 py-2 rounded-full text-sm font-semibold">
                <i className="fas fa-certificate mr-1"></i> Full Stack Java Developer – Naresh IT
              </span>
              <span className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-4 py-2 rounded-full text-sm font-semibold">
                <i className="fas fa-certificate mr-1"></i> Full Stack Laravel 11 – Udemy
              </span>
              <span className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-4 py-2 rounded-full text-sm font-semibold">
                <i className="fas fa-certificate mr-1"></i> Manual Testing – Profound Edutech
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Blogs */}
      <section id="blogs" className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <div className="text-center mb-12" data-aos="fade-up">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">Tech Blogs & Insights</h2>
            <div className="w-16 h-1 gradient-bg mx-auto mt-3 rounded-full"></div>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { img: "https://sustainixsh.com/wp-content/uploads/2025/08/AI-and-ChatGPT-Latest-advancements-and-how-to-use-them-edited-800x445.jpg", title: "AI & ChatGPT: Latest Advancements", desc: "How to leverage AI in 2025 workflows.", link: "https://sustainixsh.com/ai-and-chatgpt-latest-advancements-and-how-to-use-them/" },
              { img: "https://sustainixsh.com/wp-content/uploads/2025/07/PHP-Projects-Practice-Building-a-Secure-PHP-Blog-with-User-Authentication-A-Step-by-Step-Guide-800x445.png", title: "Secure PHP Blog with Auth", desc: "Step-by-step authentication guide.", link: "https://sustainixsh.com/php-projects-practice-building-a-secure-php-blog-with-user-authentication-a-step-by-step-guide/" },
              { img: "https://sustainixsh.com/wp-content/uploads/2025/07/What-is-Next.js-A-Beginner-Friendly-Guide-800x445.png", title: "What is Next.js? Beginner Guide", desc: "Understand SSR and modern React.", link: "https://sustainixsh.com/what-is-next-js-a-beginner-friendly-guide/" },
            ].map((blog, idx) => (
              <div key={idx} className="bg-white dark:bg-gray-700 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition" data-aos="fade-up" data-aos-delay={idx * 100}>
                <img src={blog.img} alt={blog.title} className="h-48 w-full object-cover" />
                <div className="p-5">
                  <h3 className="font-bold text-xl text-gray-900 dark:text-white">{blog.title}</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{blog.desc}</p>
                  <a href={blog.link} target="_blank" className="inline-block mt-3 text-blue-600 dark:text-blue-400 font-semibold">Read More →</a>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <a href="https://sustainixsh.com/category/tech/" target="_blank" className="inline-flex items-center gap-2 text-blue-700 dark:text-blue-300 font-semibold border border-blue-600 dark:border-blue-400 px-5 py-2 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/30 transition">
              View All Articles <i className="fas fa-external-link-alt"></i>
            </a>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-6xl mx-auto px-6 md:px-8">
          <div className="text-center mb-10" data-aos="fade-up">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">Let's Connect</h2>
            <div className="w-16 h-1 gradient-bg mx-auto mt-3 rounded-full"></div>
            <p className="text-gray-500 dark:text-gray-400 mt-4">Ready to build something great? Reach out!</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800 rounded-3xl shadow-xl p-8 md:p-10" data-aos="zoom-in">
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div>
                <i className="fas fa-envelope fa-3x text-blue-500"></i>
                <h4 className="font-bold text-xl mt-3 text-gray-900 dark:text-white">Email</h4>
                <a href="mailto:hiteshahire4887@gmail.com" className="text-gray-600 dark:text-gray-300 hover:text-blue-600">hiteshahire4887@gmail.com</a>
              </div>
              <div>
                <i className="fas fa-phone-alt fa-3x text-blue-500"></i>
                <h4 className="font-bold text-xl mt-3 text-gray-900 dark:text-white">Call</h4>
                <a href="tel:+919168823775" className="text-gray-600 dark:text-gray-300 hover:text-blue-600">+91 9168823775</a>
              </div>
              <div>
                <i className="fab fa-whatsapp fa-3x text-green-500"></i>
                <h4 className="font-bold text-xl mt-3 text-gray-900 dark:text-white">WhatsApp</h4>
                <a href="https://wa.me/919168823775" target="_blank" className="text-gray-600 dark:text-gray-300 hover:text-green-600">Chat instantly</a>
              </div>
            </div>
            <div className="border-t my-8 border-gray-200 dark:border-gray-600"></div>
            <div className="text-center">
              <h5 className="font-semibold mb-3 text-gray-900 dark:text-white">Follow me</h5>
              <div className="flex justify-center gap-4">
                <a href="https://www.linkedin.com/in/hitesh-ahire-b85aa2235/" target="_blank" className="bg-white dark:bg-gray-700 w-10 h-10 rounded-full flex items-center justify-center hover:bg-blue-100 dark:hover:bg-blue-900/30 transition shadow-sm">
                  <i className="fab fa-linkedin-in text-blue-700 dark:text-blue-400"></i>
                </a>
                <a href="https://www.instagram.com/ns_rdr_hit" target="_blank" className="bg-white dark:bg-gray-700 w-10 h-10 rounded-full flex items-center justify-center hover:bg-pink-100 dark:hover:bg-pink-900/30 transition shadow-sm">
                  <i className="fab fa-instagram text-pink-600 dark:text-pink-400"></i>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-gray-950 text-gray-300 dark:text-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p>© {new Date().getFullYear()} Hitesh Ahire — Full Stack Software Developer. All rights reserved.</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">📍 Nashik, Maharashtra, India | Serving clients worldwide</p>
        </div>
      </footer>
    </>
  );
}