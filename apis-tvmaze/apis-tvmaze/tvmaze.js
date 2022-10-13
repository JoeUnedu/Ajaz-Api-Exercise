// set id to error, ename is for error name that appears, and eSeasion
//is detailed description
//  image for search to show error
function objectProperty(id, eName, eSeason, eImage) {
  return {
    id,
    name: eName,
    summary: eSeason,
    image: eImage,
  };
}

async function searchForShowsGet(
  urlOfTvMaze,
  errOfObjMsg,
  dataOfApi,
  queryOfSearchName
) {
  // Let request for Ajax for maze api.

  try {
    const response = await axios.get(urlOfTvMaze);

    if (response.status === 200) {
      if (response.data.length > 0) {
        const dataApiHolder = dataOfApi(response.data, queryOfSearchName);

        return dataApiHolder;
      } else {
        return [
          objectProperty(
            "Err",
            errOfObjMsg.noError.errMsg,
            `${errOfObjMsg.noError.errDesc}TVmaze response = ${response.status}.`,
            errOfObjMsg.noError.image
          ),
        ];
      }
    } else {
      return [
        objectProperty(
          "Err",
          errOfObjMsg.notAnErrOf.errMsg,
          `${errOfObjMsg.notAnErrOf.errDesc}TVmaze response = ${response.status}.`,
          errOfObjMsg.notAnErrOf.image
        ),
      ];
    }
  } catch (err) {
    return [
      objectProperty(
        "Err",
        errOfObjMsg.errUnexpected.errMsg,
        `Error of  (${err.message}) when trying to connect . ${errOfObjMsg.errUnexpected.errDesc}`,
        errOfObjMsg.errUnexpected.image
      ),
    ];
  }
}

// shows Of object returns array of object
//query text is the text used  in the search area
function arrayOfShowsOfData(showsOfObj, queryOfText) {
  const showsOfArrayHolder = [];

  for (let s of showsOfObj) {
    let isImg = "./images/tv-maze.jpg";

    if (s.show.image) {
      if (s.show.image.medium) {
        isImg = s.show.image.medium;
      } else {
        isImg;
      }
    } else {
      isImg;
    }

    showsOfArrayHolder.push({
      id: s.show.id,
      name: s.show.name,
      summary: s.show.summary,
      image: isImg,
    });
  }

  // this array will show error if something has gone wrong.
  if (showsOfArrayHolder.length === 0) {
    showsOfArrayHolder.push(
      objectProperty(
        "Err",
        "Something has gone wrong, waite...",
        `There is a glitch,waite.. ${showsOfObj.length}  '${queryOfText}'.`,
        "./images/pix.com.jpg"
      )
    );
  }

  return showsOfArrayHolder;
}

//poppulate shows  for details of each shows
function populateShows(shows) {
  const $showsListHolder = $("#shows-list");
  $showsListHolder.empty();

  let episodeModalHolder = ` <a href="#" class="d-block mt-3 btn btn-lg btn-primary" 
  data-bs-toggle="modal" data-bs-target="#episodeModal">Episodes</a>`;

  //  id may have an image for error
  if (shows[0].id !== "Err") {
    episodeModalHolder;
  }

  for (let s of shows) {
    let $term = $(
      `<div class=" col-md-6 col-lg-3 Show" data-show-id="${s.id}">
      <img 
      src="http://static.tvmaze.com/uploads/images/medium_portrait/160/401704.jpg" 
      alt="Bletchly Circle San Francisco" 
      class="w-25 mr-3">
           <div class="card" data-show-id="${s.id}">
             <div class="card-body">
               <h3 class="card-title">${s.name}</h3>
               <p class="card-text">${s.summary}</p>
               <img class="card-img-top" src="${s.image}">
               ${episodeModalHolder}
             </div>
           </div>
         </div>
        `
    );

    $showsListHolder.append($term);
  }
}

// array of object returnd to api by epsidoeObj
// nname of the show to use in the msg
function episodesOfArrayData(episodesOfObj, nameOfShow) {
  const episodeArrayHolder = [];

  for (let e of episodesOfObj) {
    episodeArrayHolder.push({
      id: e.id,
      name: e.name,
      season: e.season,
      number: e.number,
      summary: e.summary,
      url: e.url,
    });
  }

  if (episodeArrayHolder.length === 0) {
    episodeArrayHolder.push(
      objectProperty(
        "Err",
        "",
        `There is a glitch,waite <br>the ${episodesOfObj.length}  "${nameOfShow}".`,
        ""
      )
    );
  }

  return episodeArrayHolder;
}

// array of episode orbject
// show page name  by the id
// name of show in the list
function populateEpisodes(episodesOfObj, showPageName, nameOfShow) {
  const $episodesList = $("#episodes-list");
  $episodesList.empty();

  $("#episode-area").text(`"${nameOfShow}" Episodes`);

  if (episodesOfObj[0].id === "Err") {
    let $item = $(
      `<li class="" data-episode-id="${showPageName}-${episodesOfObj[0].id}
      ">${episodesOfObj[0].summary}</li>`
    );

    $episodesList.append($item);

    return "Err";
  } else {
    for (let e of episodesOfObj) {
      let $item = $(
        `<li class="" data-episode-id="${showPageName}-${e.id}">
          <a href="${e.url}" target="${showPageName}">"
          <strong>${e.name}</strong>"</a> 
          (season ${e.season}, number ${e.number}) 
          </li>`
      );

      $episodesList.append($item);
    }

    return "Great";
  }
}

// handle event  is for submission
$("#search-form").on("submit", async function handleSearch(event) {
  event.preventDefault();

  // For the value in the search query, let us trim trailing space.
  let searchQuery = $("#search-query").val().trim();
  if (!searchQuery) return;

  $("#episodes-area").hide();

  let queryHolder = searchQuery.split(" ").join("%20");
  queryHolder = queryHolder.split("'").join();

  const searchForError = {
    noError: {
      errMsg: "No show!!",
      errDesc: `Nothing found '${searchQuery}'. <br><br>`,
      image: "./images/tv-maze.jpg",
    },
  };

  let urlTvMaze = `https://api.tvmaze.com/search/shows?q=${queryHolder}`;
  let shows = await searchForShowsGet(
    urlTvMaze,
    searchForError,
    arrayOfShowsOfData,
    searchQuery
  );

  populateShows(shows);
});

$("#shows-list").on("click", "a", async function () {
  const $div = $(this).parents("div.Show");
  const dataShowId = +$(this).closest("div.card").attr("data-show-id");
  const showName = $(this).siblings("h5").text();

  if (dataShowId > 0) {
    // let get episode error
    const getEpisodeErrors = {
      noError: {
        errMsg: "",
        errDesc: `No episodes were found for '${showName}'. <br>`,
        image: "",
      },
    };

    let urlTvMaze = `https://api.tvmaze.com/shows/${dataShowId}/episodes`;
    let episodes = await searchForShowsGet(
      urlTvMaze,
      getEpisodeErrors,
      episodesOfArrayData,
      showName
    );
    let clearEpsiode = "p.episode-clear";

    if (populateEpisodes(episodes, dataShowId, showName) === "Great") {
      if (episodes.length > 1) {
        $(clearEpsiode).text(`${episodes.length} episodes`);
      } else {
        $(clearEpsiode).text(`${episodes.length} episode`);
      }
    } else {
      $(clearEpsiode).text("");
    }
  }
});
