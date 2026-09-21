"use strict";

/*
 * LOGOS AI FRONTEND
 *
 * Handles:
 * - Login
 * - Chat
 * - Chat history
 * - PIN redemption
 * - Plans
 * - Theme
 * - Image/video modes
 * - Responsive sidebar
 */

const LOGOS = {

  user: null,

  plan: "FREE",

  mode: "chat",

  chats: [],

  currentChat: [],

  init() {

    this.loadUser();

    this.loadChats();

    this.loadTheme();

    this.setupAuth();

    this.setupUI();

    this.setupComposer();

    this.setupPIN();

    this.setupPlans();

    this.renderHistory();

    this.updateAccountUI();

  },


  /* =========================
     STORAGE
  ========================= */

  loadUser() {

    const saved =
      localStorage.getItem("logos_user");

    if (!saved) return;

    try {

      const user = JSON.parse(saved);

      this.user = user;

      this.plan =
        user.plan || "FREE";

      this.showApp();

    } catch {

      localStorage.removeItem("logos_user");

    }

  },


  saveUser() {

    if (!this.user) return;

    this.user.plan = this.plan;

    localStorage.setItem(
      "logos_user",
      JSON.stringify(this.user)
    );

  },


  loadChats() {

    try {

      this.chats =
        JSON.parse(
          localStorage.getItem("logos_chats")
        ) || [];

    } catch {

      this.chats = [];

    }

  },


  saveChats() {

    localStorage.setItem(
      "logos_chats",
      JSON.stringify(this.chats)
    );

  },


  /* =========================
     AUTH
  ========================= */

  setupAuth() {

    const form =
      document.getElementById("loginForm");

    if (!form) return;

    form.addEventListener(
      "submit",
      (event) => {

        event.preventDefault();

        const name =
          document
            .getElementById("loginName")
            .value.trim();

        const email =
          document
            .getElementById("loginEmail")
            .value.trim()
            .toLowerCase();

        if (!name || !email) return;

        this.user = {

          id:
            "user_" +
            Date.now(),

          name,

          email,

          plan: "FREE",

          createdAt:
            new Date().toISOString()

        };

        this.plan = "FREE";

        this.saveUser();

        this.showApp();

        this.updateAccountUI();

      }
    );

  },


  showApp() {

    document
      .getElementById("authScreen")
      ?.classList.add("hidden");

    document
      .getElementById("app")
      ?.classList.remove("hidden");

  },


  logout() {

    localStorage.removeItem(
      "logos_user"
    );

    this.user = null;

    location.reload();

  },


  /* =========================
     UI
  ========================= */

  setupUI() {

    this.on(
      "newChat",
      "click",
      () => this.newChat()
    );

    this.on(
      "mobileMenu",
      "click",
      () => {
        document
          .getElementById("sidebar")
          ?.classList.add("open");
      }
    );

    this.on(
      "closeSidebar",
      "click",
      () => {
        document
          .getElementById("sidebar")
          ?.classList.remove("open");
      }
    );

    this.on(
      "userMenu",
      "click",
      () => {
        document
          .getElementById("userMenuPanel")
          ?.classList.toggle("hidden");
      }
    );

    this.on(
      "logoutButton",
      "click",
      () => this.logout()
    );

    this.on(
      "upgradeButton",
      "click",
      () => this.openModal("upgradeModal")
    );

    this.on(
      "topUpgrade",
      "click",
      () => this.openModal("upgradeModal")
    );

    this.on(
      "redeemButton",
      "click",
      () => this.openModal("pinModal")
    );

    this.on(
      "topRedeem",
      "click",
      () => this.openModal("pinModal")
    );

    this.on(
      "themeButton",
      "click",
      () => this.toggleTheme()
    );

    this.on(
      "settingsTheme",
      "click",
      () => this.toggleTheme()
    );


    document
      .querySelectorAll("[data-close]")
      .forEach(button => {

        button.addEventListener(
          "click",
          () => {

            this.closeModal(
              button.dataset.close
            );

          }
        );

      });


    document
      .querySelectorAll("[data-prompt]")
      .forEach(button => {

        button.addEventListener(
          "click",
          () => {

            const input =
              document.getElementById(
                "messageInput"
              );

            input.value =
              button.dataset.prompt;

            input.focus();

          }
        );

      });

  },


  on(id, event, callback) {

    document
      .getElementById(id)
      ?.addEventListener(
        event,
        callback
      );

  },


  /* =========================
     COMPOSER
  ========================= */

  setupComposer() {

    const input =
      document.getElementById(
        "messageInput"
      );

    const send =
      document.getElementById(
        "sendButton"
      );

    if (!input || !send) return;


    input.addEventListener(
      "input",
      () => {

        input.style.height =
          "auto";

        input.style.height =
          Math.min(
            input.scrollHeight,
            170
          ) + "px";

      }
    );


    input.addEventListener(
      "keydown",
      event => {

        if (
          event.key === "Enter" &&
          !event.shiftKey
        ) {

          event.preventDefault();

          this.sendMessage();

        }

      }
    );


    send.addEventListener(
      "click",
      () => this.sendMessage()
    );


    document
      .querySelectorAll("[data-mode]")
      .forEach(button => {

        button.addEventListener(
          "click",
          () => {

            document
              .querySelectorAll(
                "[data-mode]"
              )
              .forEach(
                b => b.classList.remove(
                  "active"
                )
              );

            button.classList.add(
              "active"
            );

            this.mode =
              button.dataset.mode;

            const label =
              document.getElementById(
                "modeLabel"
              );

            const names = {

              chat: "Chat",

              image:
                "Image generation",

              video:
                "Video generation"

            };

            label.textContent =
              names[this.mode] ||
              "Chat";

          }
        );

      });

  },


  async sendMessage() {

    const input =
      document.getElementById(
        "messageInput"
      );

    const text =
      input.value.trim();

    if (!text) return;


    input.value = "";

    input.style.height = "auto";


    const welcome =
      document.getElementById(
        "welcome"
      );

    welcome?.remove();


    this.addMessage(
      "user",
      text
    );


    this.currentChat.push({

      role: "user",

      content: text

    });


    const typing =
      this.addTyping();


    try {

      if (this.mode === "image") {

        const result =
          await this.generate(
            "/api/generate-image",
            {
              prompt: text,
              user: this.user
            }
          );

        typing.remove();

        this.addGenerationResult(
          "image",
          result
        );

        return;

      }


      if (this.mode === "video") {

        const result =
          await this.generate(
            "/api/generate-video",
            {
              prompt: text,
              user: this.user
            }
          );

        typing.remove();

        this.addGenerationResult(
          "video",
          result
        );

        return;

      }


      const result =
        await this.generate(
          "/api/chat",
          {

            message: text,

            user: this.user,

            plan: this.plan,

            history:
              this.currentChat

          }
        );


      typing.remove();


      const reply =
        result.reply ||
        result.message ||
        "I couldn't generate a response.";


      this.addMessage(
        "assistant",
        reply
      );


      this.currentChat.push({

        role: "assistant",

        content: reply

      });


    } catch (error) {

      console.error(error);

      typing.remove();

      this.addMessage(
        "assistant",
        "LOGOS couldn't connect to the AI service. Please try again."
      );

    }

  },


  async generate(endpoint, body) {

    const response =
      await fetch(
        endpoint,
        {

          method: "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body:
            JSON.stringify(body)

        }
      );


    if (!response.ok) {

      throw new Error(
        "API request failed"
      );

    }


    return response.json();

  },


  /* =========================
     MESSAGE UI
  ========================= */

  addMessage(role, text) {

    const container =
      document.getElementById(
        "messages"
      );


    const message =
      document.createElement(
        "div"
      );

    message.className =
      "message " +
      (role === "user"
        ? "user"
        : "assistant");


    const avatar =
      document.createElement(
        "div"
      );

    avatar.className =
      "avatar " +
      (role === "user"
        ? "you"
        : "ai");

    avatar.textContent =
      role === "user"
        ? "YOU"
        : "L";


    const content =
      document.createElement(
        "div"
      );

    content.className =
      "message-content";


    const roleName =
      document.createElement(
        "div"
      );

    roleName.className =
      "message-role";

    roleName.textContent =
      role === "user"
        ? this.user?.name || "You"
        : "LOGOS";


    const body =
      document.createElement(
        "div"
      );

    body.className =
      "message-text";

    body.textContent =
      text;


    content.appendChild(
      roleName
    );

    content.appendChild(
      body
    );

    message.appendChild(
      avatar
    );

    message.appendChild(
      content
    );

    container.appendChild(
      message
    );


    this.scrollBottom();

  },


  addTyping() {

    const container =
      document.getElementById(
        "messages"
      );


    const message =
      document.createElement(
        "div"
      );

    message.className =
      "message assistant";


    message.innerHTML = `

      <div class="avatar ai">
        L
      </div>

      <div class="message-content">

        <div class="message-role">
          LOGOS
        </div>

        <div class="typing">

          <span></span>
          <span></span>
          <span></span>

        </div>

      </div>

    `;


    container.appendChild(
      message
    );


    this.scrollBottom();


    return message;

  },


  addGenerationResult(
    type,
    result
  ) {

    const text =
      result?.message ||
      result?.url ||
      (
        type === "image"
          ? "Image generation completed."
          : "Video generation completed."
      );


    this.addMessage(
      "assistant",
      text
    );

  },


  scrollBottom() {

    const area =
      document.getElementById(
        "chatArea"
      );

    area.scrollTo({

      top:
        area.scrollHeight,

      behavior:
        "smooth"

    });

  },


  /* =========================
     NEW CHAT
  ========================= */

  newChat() {

    if (
      this.currentChat.length
    ) {

      this.chats.unshift({

        id:
          Date.now(),

        title:
          this.currentChat[0]
            ?.content
            ?.slice(0, 45) ||
          "New chat",

        messages:
          [...this.currentChat]

      });

      this.saveChats();

    }


    this.currentChat = [];


    document.getElementById(
      "messages"
    ).innerHTML = `

      <div
        class="welcome"
        id="welcome"
      >

        <div class="anime-logo">

          <div class="anime-ring"></div>

          <div class="anime-face">
            L
          </div>

        </div>

        <h1>
          How can I help you today?
        </h1>

        <p>
          Ask LOGOS anything.
        </p>

      </div>

    `;


    this.renderHistory();

  },


  /* =========================
     HISTORY
  ========================= */

  renderHistory() {

    const history =
      document.getElementById(
        "chatHistory"
      );

    if (!history) return;


    history.innerHTML = "";


    this.chats
      .slice(0, 30)
      .forEach(chat => {

        const item =
          document.createElement(
            "div"
          );

        item.className =
          "history-item";

        item.textContent =
          chat.title ||
          "New chat";


        item.addEventListener(
          "click",
          () => {

            this.loadChat(
              chat.id
            );

          }
        );


        history.appendChild(
          item
        );

      });

  },


  loadChat(id) {

    const chat =
      this.chats.find(
        item => item.id === id
      );

    if (!chat) return;


    const container =
      document.getElementById(
        "messages"
      );

    container.innerHTML = "";


    this.currentChat =
      [...chat.messages];


    this.currentChat.forEach(
      message => {

        this.addMessage(
          message.role,
          message.content
        );

      }
    );

  },


  /* =========================
     PIN SYSTEM
  ========================= */

  setupPIN() {

    const form =
      document.getElementById(
        "pinForm"
      );

    if (!form) return;


    form.addEventListener(
      "submit",
      event => {

        event.preventDefault();

        const input =
          document.getElementById(
            "pinInput"
          );

        const result =
          document.getElementById(
            "pinResult"
          );


        const pin =
          input.value
            .trim()
            .toUpperCase();


        const activation =
          redeemLOGOSPin(
            pin,
            this.user
          );


        if (!activation.success) {

          result.style.color =
            "#ef4444";

          result.textContent =
            activation.message;

          return;

        }


        this.plan =
          activation.tier;


        this.user.plan =
          activation.tier;


        this.saveUser();

        this.updateAccountUI();


        result.style.color =
          "#10a37f";

        result.textContent =
          `✓ ${activation.tier} activated successfully.`;


        input.value = "";


        setTimeout(
          () => {

            this.closeModal(
              "pinModal"
            );

          },
          1200
        );

      }
    );

  },


  /* =========================
     PLANS
  ========================= */

  setupPlans() {

    document
      .querySelectorAll(
        "[data-tier]"
      )
      .forEach(button => {

        button.addEventListener(
          "click",
          () => {

            const tier =
              button.dataset.tier;

            this.closeModal(
              "upgradeModal"
            );

            this.openModal(
              "pinModal"
            );


            const result =
              document.getElementById(
                "pinResult"
              );

            result.style.color =
              "var(--muted)";

            result.textContent =
              `Enter your ${tier} PIN after payment.`;

          }
        );

      });

  },


  /* =========================
     ACCOUNT
  ========================= */

  updateAccountUI() {

    if (!this.user) return;


    const name =
      document.getElementById(
        "userName"
      );

    const plan =
      document.getElementById(
        "userPlan"
      );

    const avatar =
      document.getElementById(
        "userAvatar"
      );

    const email =
      document.getElementById(
        "settingsEmail"
      );


    if (name)
      name.textContent =
        this.user.name;


    if (plan)
      plan.textContent =
        this.plan;


    if (avatar)
      avatar.textContent =
        this.user.name
          .charAt(0)
          .toUpperCase();


    if (email)
      email.textContent =
        this.user.email;

  },


  /* =========================
     THEME
  ========================= */

  loadTheme() {

    const theme =
      localStorage.getItem(
        "logos_theme"
      );


    if (theme === "dark") {

      document.body
        .classList
        .add("dark");

    }

  },


  toggleTheme() {

    document.body
      .classList
      .toggle("dark");


    localStorage.setItem(

      "logos_theme",

      document.body.classList.contains(
        "dark"
      )
        ? "dark"
        : "light"

    );

  },


  /* =========================
     MODALS
  ========================= */

  openModal(id) {

    document
      .getElementById(id)
      ?.classList
      .remove("hidden");

  },


  closeModal(id) {

    document
      .getElementById(id)
      ?.classList
      .add("hidden");

  }

};


document.addEventListener(
  "DOMContentLoaded",
  () => LOGOS.init()
);
