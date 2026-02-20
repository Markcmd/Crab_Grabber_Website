// public/js/i18n.js
// Bilingual i18n (EN / 中文) using data-i18n="key" + a toggle button #langToggle

(function () {
    const dict = {
      en: {
        nav_home: "Home",
        nav_menu: "Menu",
        nav_about: "About Us",
        nav_contact: "Contact & Location",
        brand_name: "Crab Grabber",
        home_badge: "Seafood • Cajun Boil",

        // Common buttons
        btn_view_menu: "View Menu",
        btn_join_waitlist: "Join Waitlist",
        btn_call_now: "Call Now",
        btn_directions: "Get Directions",
  
        // Menu page
        menu_title: "Menu",
        menu_subtitle: "Our full seafood and chef special menu.",
        menu_section_1: "Seafood Boil & Fried Menu",
        menu_section_2: "Chef Special & Noodles Menu",
  
        // About page
        about_title: "Our Story",
        about_p1:
          "Crab Grabber was founded with a simple mission: bring fresh, bold, and unforgettable seafood experiences to our community. Inspired by coastal seafood markets and Cajun boil traditions, we focus on quality ingredients, authentic flavors, and a welcoming atmosphere.",
        about_fresh_title: "Freshness First",
        about_fresh_body:
          "We source seafood daily to ensure peak freshness and flavor. Our live tanks and careful handling help deliver high quality crab, shrimp, lobster, and shellfish.",
        about_cajun_title: "Authentic Cajun Experience",
        about_cajun_body:
          "Our house blend seasoning combines traditional Cajun spices with our signature flavors. Every boil is customizable to your preferred spice level.",
        about_mission_title: "Our Mission",
        about_mission_body:
          "Create a place where friends and family gather to enjoy fresh seafood, celebrate special moments, and create lasting memories.",
        about_why_title: "Why Choose Crab Grabber",
        about_visit_title: "Visit Us",
        about_visit_body:
          "We welcome you to experience Crab Grabber and enjoy the best seafood in town. Join our waitlist online or visit us in person.",
        about_th_feature: "Feature",
        about_th_description: "Description",
        
        about_feature_fresh: "Fresh Seafood",
        about_feature_fresh_desc: "Delivered daily and prepared to order",
        
        about_feature_custom: "Custom Boils",
        about_feature_custom_desc: "Choose spice level, seasoning, and add-ons",
        
        about_feature_family: "Family Friendly",
        about_feature_family_desc: "Perfect for gatherings and celebrations",
        
        about_feature_fast: "Fast Service",
        about_feature_fast_desc: "Efficient waitlist system and quick seating",


        // Contact page
        contact_title: "Visit Crab Grabber",
        contact_p1:
          "Experience fresh seafood and bold Cajun flavors. Find our contact details, hours, and directions below. We look forward to serving you.",
        contact_info_title: "Restaurant Information",
        contact_map_title: "Location Map",
        contact_hours_title: "Hours of Operation",
        contact_directions_title: "Directions",
        contact_touch_title: "Get in Touch",
        contact_touch_body:
          "Have questions about our menu, wait times, or special events? Contact us anytime.",
        contact_label_address: "Address",
        contact_label_phone: "Phone",
        contact_label_email: "Email",
        contact_addr_line1: "3589 E Colorado Blvd",
        contact_addr_line2: "Pasadena, CA 91107",
        contact_phone_display: "(626) 529-6533",
        contact_email: "contact@crabgrabber.com",
        contact_walkins_note: "Walk-ins welcome. Reservations and waitlist available online.",
        contact_parking_note: "Free and street parking available nearby.",
        contact_hours_th_day: "Day",
        contact_hours_th_hours: "Hours",
        contact_hours_mon_thu: "Monday – Thursday",
        contact_hours_mon_thu_time: "11:30 AM – 9:30 PM",
        contact_hours_fri_sat: "Friday – Saturday",
        contact_hours_fri_sat_time: "11:30 AM – 10:00 PM",
        contact_hours_sun: "Sunday",
        contact_hours_sun_time: "11:30 AM – 9:30 PM",


        footer_copy: "© 2026 Crab Grabber. All rights reserved.",
        lang_label: "中文"
      },
  
      zh: {
        nav_home: "首页",
        nav_menu: "菜单",
        nav_about: "关于我们",
        nav_contact: "联系与地址",
        brand_name: "Crab Grabber",
        home_badge: "海鲜 • 卡真风味",

        // Common buttons
        btn_view_menu: "查看菜单",
        btn_join_waitlist: "加入等位",
        btn_call_now: "立即拨打",
        btn_directions: "导航到店",
  
        // Menu page
        menu_title: "菜单",
        menu_subtitle: "完整海鲜与主厨特色菜单。",
        menu_section_1: "海鲜煮锅 & 炸物菜单",
        menu_section_2: "主厨特色 & 面食菜单",
  
        // About page
        about_title: "我们的故事",
        about_p1:
          "Crab Grabber 的目标很简单：为社区带来新鲜、浓郁、难忘的海鲜体验。我们结合海边海鲜市场与卡真煮锅传统，坚持优质食材、地道风味与温暖的用餐氛围。",
        about_fresh_title: "新鲜优先",
        about_fresh_body:
          "我们每日采购海鲜，确保最佳新鲜度与口感。活鲜水箱与严格处理流程，帮助呈现高品质的螃蟹、虾、龙虾与贝类。",
        about_cajun_title: "地道卡真体验",
        about_cajun_body:
          "我们的招牌混合香料融合传统卡真风味与独家配方。每份煮锅都可按你的辣度偏好定制。",
        about_mission_title: "我们的使命",
        about_mission_body:
          "打造一个让朋友与家人相聚的地方：享用新鲜海鲜、庆祝重要时刻、留下美好回忆。",
        about_why_title: "为什么选择 Crab Grabber",
        about_visit_title: "欢迎光临",
        about_visit_body:
          "欢迎来 Crab Grabber 体验本地高品质海鲜。你可以在线加入等位，或直接到店用餐。",
        about_th_feature: "特点",
        about_th_description: "说明",
        
        about_feature_fresh: "新鲜海鲜",
        about_feature_fresh_desc: "每日配送，新鲜现做",
        
        about_feature_custom: "自定义煮锅",
        about_feature_custom_desc: "可选择辣度、调味和配料",
        
        about_feature_family: "适合家庭",
        about_feature_family_desc: "适合聚会与庆祝",
        
        about_feature_fast: "快速服务",
        about_feature_fast_desc: "高效等位系统与快速入座",

        // Contact page
        contact_title: "欢迎光临 Crab Grabber",
        contact_p1:
          "品尝新鲜海鲜与浓郁卡真风味。下方可查看联系方式、营业时间与导航路线。期待为你服务。",
        contact_info_title: "餐厅信息",
        contact_map_title: "地图位置",
        contact_hours_title: "营业时间",
        contact_directions_title: "到店路线",
        contact_touch_title: "联系我们",
        contact_touch_body:
        "如果你对菜单、等位时间或活动有疑问，欢迎随时联系我们。",
        contact_label_address: "地址",
        contact_label_phone: "电话",
        contact_label_email: "邮箱",
        contact_addr_line1: "3589 E Colorado Blvd",
        contact_addr_line2: "Pasadena, CA 91107",
        contact_phone_display: "(626) 529-6533",
        contact_email: "contact@crabgrabber.com",
        contact_walkins_note: "欢迎直接到店。也可在线加入等位。",
        contact_parking_note: "附近有免费停车位与路边停车。",
        contact_hours_th_day: "星期",
        contact_hours_th_hours: "营业时间",
        contact_hours_mon_thu: "周一至周四",
        contact_hours_mon_thu_time: "11:30 AM – 9:30 PM",
        contact_hours_fri_sat: "周五至周六",
        contact_hours_fri_sat_time: "11:30 AM – 10:00 PM",
        contact_hours_sun: "周日",
        contact_hours_sun_time: "11:30 AM – 9:30 PM",


        footer_copy: "© 2026 Crab Grabber. All rights reserved.",
        lang_label: "EN"
      }
    };
  
    function getLang() {
      const saved = localStorage.getItem("lang");
      return saved === "zh" ? "zh" : "en";
    }
  
    function setLang(lang) {
      localStorage.setItem("lang", lang);
    }
  
    function applyLang(lang) {
      const d = dict[lang] || dict.en;
  
      document.querySelectorAll("[data-i18n]").forEach((el) => {
        const key = el.getAttribute("data-i18n");
        const val = d[key];
        if (typeof val === "string") el.textContent = val;
      });
  
      const toggle = document.getElementById("langToggle");
      if (toggle) toggle.textContent = d.lang_label || (lang === "zh" ? "EN" : "中文");
  
      document.documentElement.setAttribute("lang", lang === "zh" ? "zh-CN" : "en");
    }
  
    function init() {
      applyLang(getLang());
  
      const toggle = document.getElementById("langToggle");
      if (toggle) {
        toggle.addEventListener("click", () => {
          const next = getLang() === "en" ? "zh" : "en";
          setLang(next);
          applyLang(next);
        });
      }
    }
  
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", init);
    } else {
      init();
    }
  })();