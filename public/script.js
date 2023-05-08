(function () {
  "use strict";

  let container = document.querySelector(".container");
  let cards_container = document.querySelector(".cards_container");
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
    card.dataset.id = job.id;

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
    tag_role.dataset.term = job.role;
    tag_role.innerText = job.role;

    //Job Level
    let tag_level = card.querySelector(".tag_level");
    tag_level.dataset.term = job.level;
    tag_level.innerText = job.level;

    // Job Tags
    let job_tags = card.querySelector(".job__tags");

    const { languages } = job;

    languages.forEach((language) => {
      let tag = document.createElement("DIV");
      tag.classList.add("tag_language", "tag");
      tag.innerText = language;
      tag.dataset.term = language;
      job_tags.append(tag);
    });
    cards_container.append(card);

    let tags = card.querySelectorAll(".tag");
    tags.forEach((tag) => {
      tag.addEventListener("click", function (el) {
        let search_term = this.dataset.term;
        handle_filters(search_term);
      });
    });
  }

  function add_to_filter(value) {
    let filter__jobs_field = document.querySelector(".filter__jobs_field");
    let pill = document.createElement("DIV");
    pill.classList.add("pill");
    pill.dataset.term = value;
    pill.innerText = value;
    filter__jobs_field.append(pill);

    pill.addEventListener("click", function (e) {
      remove_filters(pill.dataset.term);
      var filters = get_item("search");
      show_filtered_selection(filters);
      filter_show_or_hide();
    });
  }

  function show_filtered_selection(filters = []) {
    let selected_jobs = JOB_DATA.filter((job) => {
      let select_job = filters.every((filter) => {
        return [job.role, job.level, ...job.languages].includes(filter);
      });
      return !!select_job;
    });

    let job_ids = selected_jobs.map((job) => job.id);
    var jobs = JOB_DATA.filter((job) => {
      return job_ids.includes(job.id);
    });
    if (!jobs.length) jobs = [...JOB_DATA];
    display_list_jobs(jobs);
  }

  function display_list_jobs(job_list_data) {
    cards_container.innerHTML = "";
    job_list_data.forEach((job) => build_job_card(job));
  }

  function filter_show_or_hide() {
    let $el = document.querySelector(".filter__jobs_field");
    let pills = $el.querySelectorAll(".pill");
    if (!pills.length) {
      $el.style.opacity = 0;
      $el.style.visibility = "hidden";
      return;
    }
    $el.style.opacity = 1;
    $el.style.visibility = "visible";
  }

  function remove_filters(value, deep = false) {
    if (!deep) {
      let filter_to_remove = document.querySelector(`[data-term=${value}]`);
      if (filter_to_remove) {
        var v = filter_to_remove.dataset.term;
        remove_item("search", v) && filter_to_remove.remove();
      }
      return;
    }
    let pills = document.querySelectorAll(".pill");
    remove_item("search", null, true);
    pills.forEach((pill) => pill.remove());
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

    if (deep) set_item(key, []);

    return false;
  }

  // Handle adding and removing here
  function handle_filters(value = null, callback, options = {}) {
    var filters = get_item("search");

    if (filters && value && filters.includes(value)) return false;

    if (!filters) filters = [];

    if (value) {
      filters.push(value);
      set_item("search", filters);
      add_to_filter(value);
    }

    if (callback && typeof callback === "function") {
      callback(filters);
    }
    show_filtered_selection(filters);
    filter_show_or_hide();
  }

  function init_clear_selection() {
    let btn__clear = document.querySelector(".btn__clear");
    btn__clear.addEventListener("click", function (e) {
      remove_filters(null, true);
      handle_filters();
    });
  }

  async function init() {
    JOB_DATA = await get_data();
    JOB_DATA && JOB_DATA.length && display_list_jobs(JOB_DATA);
    handle_filters(null, (filters) =>
      filters.forEach((filter) => add_to_filter(filter))
    );
    init_clear_selection();
  }

  init();
})();
