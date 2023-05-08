(function () {
  "use strict";

  let container = document.querySelector(".container");
  var JOB_DATA = []; // global data

  const get_data = async () => {
    try {
      var resp = await fetch("./data.json");
      var resp_data = await resp.json();
      return resp_data;
    } catch (e) {
      console.error("error occurred ", e);
    }
  };

  function build_job_card(job) {
    let card_template = document.querySelector(".card_template");
    let card = card_template.cloneNode(true);
    card.classList.remove("card_template");
    card.style.display = "flex";

    let job__image = card.querySelector(".job__image");
    job__image.src = job.logo;

    let job_name = card.querySelector(".job__name");
    job_name.innerText = job.company;

    const { featured, new: new_status } = job;

    let quick_info = card.querySelector(".job__quick_info");

    if (featured || new_status) {
      if (new_status) {
        let new_status_div = document.createElement("DIV");
        new_status_div.classList.add("job__status");
        new_status_div.classList.add("new");
        new_status_div.innerText = "New!";
        quick_info.appendChild(new_status_div);
      }
      if (featured) {
        let status_div = document.createElement("DIV");
        status_div.classList.add("job__status");
        status_div.innerText = "Featured";
        quick_info.appendChild(status_div);
      }
    }

    let job_title = card.querySelector(".job__title");
    job_title.innerText = job.position;

    // Job Type
    let days_ago = card.querySelector(".days_ago");
    days_ago.innerText = job.postedAt;

    // Job Type
    let job_type = card.querySelector(".job__type");
    job_type.innerText = job.contract;

    // Job Location
    let card_location = card.querySelector(".job__location");
    card_location.innerText = job.location;

    // Job Role
    let tag_role = card.querySelector(".tag_role");
    tag_role.innerText = job.role;

    //Job Level
    let tag_level = card.querySelector(".tag_level");
    tag_level.innerText = job.level;

    // Job Tags
    let job_tags = card.querySelector(".job__tags");
    console.log(job);
    const { languages } = job;
    console.log("languages", languages);
    languages.forEach((language) => {
      let tag = document.createElement("DIV");
      tag.classList.add("tag_language", "tag");
      tag.innerText = language;
      tag.dataset.language = language;
      job_tags.append(tag);
      //Event Handler
      tag.addEventListener("click", function (e) {
        var $this = this;
        var selected = $this.dataset.language;
        handle_filters("languages", selected, () => {
          add_to_filter(selected);
        });
      });
    });
    container.append(card);
  }

  function add_to_filter(value) {
    let filter__jobs_field = document.querySelector(".filter__jobs_field");
    let pill = document.createElement("DIV");
    pill.classList.add("pill");
    pill.dataset.value = value;
    pill.innerText = value;
    filter__jobs_field.append(pill);

    pill.addEventListener("click", function (e) {
      remove_filter(pill.dataset.value);
      filter_show_or_hide(filter__jobs_field);
      show_filtered_selection();
    });
  }

  function show_filtered_selection(key = "languages") {
    let data = [];

    let languages = get_item(key);
    languages.length &&
      languages.forEach((item) => {
        let filtered_data = JOB_DATA.filter((job) => {
          return job[key].includes(item);
        });
        if (!data.length) data = filtered_data;

        if (data.length) {
          filtered_data.forEach((job) => {
            if (data.find((item) => job.id === item.id)) return;
            data.push(job);
          });
        }
      });

    document.querySelectorAll(".container > .card").forEach((e) => e.remove());

    if (!data.length) data = JOB_DATA;

    data.forEach((job) => {
      build_job_card(job);
    });
  }

  function filter_show_or_hide($el) {
    let pills = $el.querySelectorAll(".pill");
    if (!pills.length) {
      $el.style.opacity = 0;
      $el.style.visibility = "hidden";
      return;
    }
    $el.style.opacity = 1;
    $el.style.visibility = "visible";
  }

  function remove_filter(value) {
    let filter_to_remove = document.querySelector(`[data-value=${value}]`);
    if (filter_to_remove) {
      var v = filter_to_remove.dataset.value;
      remove_item("languages", v) && filter_to_remove.remove();
    }
  }

  // local storage
  function set_item(key, value) {
    value = JSON.stringify(value);
    localStorage.setItem(key, value);
  }
  function get_item(key) {
    if (localStorage.getItem(key)) {
      var value = JSON.parse(localStorage.getItem(key));
      return value;
    }
    return false;
  }
  function remove_item(key, value, deep) {
    let item = get_item(key);

    if (item && typeof item === "object" && item.length && !deep) {
      var item_to_keep = item.filter((i) => i != value);

      set_item(key, item_to_keep);
      return true;
    }

    return false;
  }

  // Handle adding and removing here
  function handle_filters(key, value = null, callback, options = {}) {
    let filters_field = document.querySelector(".filter__jobs_field");
    var filters = get_item(key);
    if (filters && value && filters.includes(value)) return false;

    if (!filters) filters = [];

    if (value) {
      filters.push(value);
      set_item(key, filters);
    }

    if (callback && typeof callback === "function") {
      callback(filters);
      filter_show_or_hide(filters_field);
    }
    show_filtered_selection();
  }

  function init_clear_selection() {
    let btn__clear = document.querySelector(".btn__clear");
    btn__clear.addEventListener("click", function (e) {
      alert("TODO");
    });
  }

  async function init() {
    JOB_DATA = await get_data();
    JOB_DATA &&
      JOB_DATA.length &&
      JOB_DATA.forEach((item) => {
        build_job_card(item);
      });
    handle_filters("languages", null, (languages) => {
      languages.forEach((language) => {
        add_to_filter(language);
      });
    });
    init_clear_selection();
  }

  init();
})();
