function initialize() {

  chrome.storage.sync.get({
    //Default
    loadFromWebsite: false,
    fullscreen: false,
    fullscreen_data: null
  }, function (storage) {
    load(storage.loadFromWebsite, storage.fullscreen, storage.fullscreen_data);
  });

  function load(loadFromWebsite, fullscreen, fullscreen_data) {
    Navigation.showAll(false);
    Navigation.showLoader(true);

    loadPageData(loadFromWebsite, fullscreen, fullscreen_data);

    Navigation.showLoader(false);
    Navigation.showHeadline(true);
    Navigation.showChooseForm(true);
    Navigation.showEdit(true);
  }

  function loadPageData(loadFromWebsite, fullscreen, fullscreen_data) {
    chrome.tabs.query({
      active: true,
      currentWindow: true
    }, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {
        type: "load"
      }, function (response) {
        //Check ob Response gesendet wurde
        if (!response) response = {
          status: "error"
        };
        console.log("[PAGE_RESPONSE]");
        console.log(response);

        global_loaded_values.type = response.status;

        if (response.status == "single" && loadFromWebsite) {

          global_loaded_values.teacher = response.lehrer;

          //Website angepasste Initialisierung
          updateCheckbox(globaldata_checkbox_oberstufe_id, response.oberstufe);

          if (response.oberstufe) {
            //Oberstufe
            global_loaded_values.klassen.oberstufe = [response.klasse];

            //Checking school data for the right lesson
            SQLHandler.getSQLSchoolData("gymlap", function onSuccess(data) {
              console.log("[SCHOOL_DATA]");
              console.log(data);

              let found = false;
              for (let k = 0; k < data.length; k++) {
                if (data[k].kurskuerzel == response.fach) {
                  found = true;
                  global_loaded_values.faecher["q" + response.klasse] = [data[k].fach];
                  global_loaded_values.kurse["q" + response.klasse][data[k].fach] = [response.kurs];
                  break;
                }
              }

              if (!found) {
                Navigation.showMessage("[SCHOOL_DATA] Error: Fach für Kürzel \"" + response.fach + "\" nicht gefunden");

                global_loaded_values.faecher["q" + response.klasse] = [response.fach];
                global_loaded_values.kurse["q" + response.klasse][response.fach] = [response.kurs];

                //Loading all other lessons as well
                for (let i = 0; i < data.length; i++) {
                  if (data[i].oberstufe.includes(response.klasse)) global_loaded_values.faecher["q" + response.klasse].push(data[i].fach);

                  if (data[i].oberstufe.includes(response.klasse)) {
                    if (data[i]["kursanzahl_" + response.klasse] == 1) {
                      global_loaded_values.kurse["q" + response.klasse][data[i].fach] = [];
                      global_loaded_values.kurse["q" + response.klasse][data[i].fach].push((response.klasse).charAt(1) + data[i].kurskuerzel + "0");
                    } else {
                      global_loaded_values.kurse["q" + response.klasse][data[i].fach] = [];
                      for (let k = 1; k <= data[i]["kursanzahl_" + response.klasse]; k++) {
                        global_loaded_values.kurse["q" + response.klasse][data[i].fach].push((response.klasse).charAt(1) + data[i].kurskuerzel + k);
                      }
                    }
                  }
                }
              }

              initUI();
            }, function onError(error) {
              console.log("[SCHOOL_DATA] Error: " + error);
              Navigation.showMessage("[SCHOOL_DATA] Error: " + error);

              global_loaded_values.faecher["q" + response.klasse] = [response.fach];
              global_loaded_values.kurse["q" + response.klasse][response.fach] = [response.kurs];

              initUI();
            });
          } else {
            //Unterstufe
            global_loaded_values.klassen.unterstufe = [response.klasse];

            //Checking school data for the right lesson
            SQLHandler.getSQLSchoolData("gymlap", function onSuccess(data) {
              console.log("[SCHOOL_DATA]");
              console.log(data);

              let found = false;
              for (let k = 0; k < data.length; k++) {
                if (data[k].kurskuerzel == response.fach) {
                  found = true;
                  global_loaded_values.faecher.unterstufe = [data[k].fach];
                  global_loaded_values.stufen[response.fach] = [response.kurs];
                  break;
                }
              }

              if (!found) {
                Navigation.showMessage("[SCHOOL_DATA] Error: Fach für Kürzel \"" + response.fach + "\" nicht gefunden");

                global_loaded_values.faecher.unterstufe = [response.fach];
                global_loaded_values.stufen[response.fach] = [response.kurs];

                //Loading all other lessons as well
                for (let i = 0; i < data.length; i++) {
                  if (data[i].unterstufe.length > 0) {
                    global_loaded_values.faecher.unterstufe.push(data[i].fach);
                    global_loaded_values.stufen[data[i].fach] = data[i].unterstufe;
                  }
                }
              }

              initUI();
            }, function onError(error) {
              console.log("[SCHOOL_DATA] Error: " + error);
              Navigation.showMessage("[SCHOOL_DATA] Error: " + error);

              global_loaded_values.faecher.unterstufe = [response.fach];
              global_loaded_values.stufen[response.fach] = [response.kurs];

              initUI();
            });
          }

        } else if (response.status == "multiple" && loadFromWebsite) {
          global_loaded_values.teacher = response.lehrer;

          global_loaded_values.faecher = response.faecher;
          global_loaded_values.stufen = response.stufen;
          global_loaded_values.kurse = response.kurse;
          global_loaded_values.klassen = response.klassen;

          initUI();

        } else if (response.status == "error" || !loadFromWebsite) {

          if (fullscreen) {
            console.log("Fullscreen!");

            global_loaded_values = fullscreen_data;

            console.log("[FULLSCREEN_DATA]");
            console.log(global_loaded_values);

            chrome.storage.sync.set({
              fullscreen: false,
              fullscreen_data: null
            }, function () {
              console.log("Fullscreen Temp-Data gelöscht");
            });

            initUI();

          } else {
            //Load data from sql server

            function onSuccess(data) {
              console.log("[SCHOOL_DATA]");
              console.log(data);

              //
              //make data to usable data... duh
              //
              let stufen = {};
              let faecher = {
                unterstufe: [],
                q11: [],
                q12: [],
                q13: []
              };
              let oberstufe_kurse = {
                q11: {},
                q12: {},
                q13: {}
              };

              for (let i = 0; i < data.length; i++) {
                //stufen
                if (data[i].unterstufe.length > 0) {
                  stufen[data[i].fach] = data[i].unterstufe;
                }

                //faecher
                if (data[i].unterstufe.length > 0) { //i know it's a duplicate
                  faecher.unterstufe.push(data[i].fach);
                }
                for (let j = 11; j <= 13; j++) {
                  if (data[i].oberstufe.includes("" + j)) faecher["q" + j].push(data[i].fach);
                }

                //kurse
                for (let j = 11; j <= 13; j++) {
                  if (data[i].oberstufe.includes("" + j)) {
                    if (data[i]["kursanzahl_" + j] == 1) {
                      oberstufe_kurse["q" + j][data[i].fach] = [];
                      oberstufe_kurse["q" + j][data[i].fach].push(("" + j).charAt(1) + data[i].kurskuerzel + "0");
                    } else {
                      oberstufe_kurse["q" + j][data[i].fach] = [];
                      for (let k = 1; k <= data[i]["kursanzahl_" + j]; k++) {
                        oberstufe_kurse["q" + j][data[i].fach].push(("" + j).charAt(1) + data[i].kurskuerzel + k);
                      }
                    }
                  }
                }

              }

              global_loaded_values.type = "multiple";
              global_loaded_values.faecher = faecher;
              global_loaded_values.klassen.unterstufe = globaldata_unterstufe;
              global_loaded_values.klassen.oberstufe = globaldata_oberstufe;
              global_loaded_values.stufen = stufen;
              global_loaded_values.kurse = oberstufe_kurse;

              initUI();
            }

            function onError(error) {
              console.log("[SCHOOL_DATA] Error: " + error);
              Navigation.showMessage("[SCHOOL_DATA] Error: " + error);
            }

            SQLHandler.getSQLSchoolData("gymlap", onSuccess, onError);
          }
        }

      });
    });
  }

  function initUI() {
    //Initialisierung der Oberfläche
    console.log("[GLOBAL_DATA]");
    console.log(global_loaded_values);
    if (global_loaded_values.type == "single") {
      if (global_loaded_values.faecher.unterstufe.length == 0) {
        var temp = global_loaded_values.faecher.q11.length == 0 ? "12" : "11";

        //Oberstufe
        updateCheckbox(globaldata_checkbox_oberstufe_id, true);
        let selectable = global_loaded_values.faecher["q" + temp].length > 1;
        updateDropdown(globaldata_dropdown_fach_id, global_loaded_values.faecher["q" + temp][0], false, selectable ? global_loaded_values.faecher["q" + temp] : []);
        updateDropdown(globaldata_dropdown_klasse_id, global_loaded_values.klassen.oberstufe[0], false, []);
        let fach = global_loaded_values.faecher["q" + temp][0];
        updateDropdown(globaldata_dropdown_stufe_id, global_loaded_values.kurse["q" + temp][fach][0], false, []);
      } else {
        //Unterstufe
        updateCheckbox(globaldata_checkbox_oberstufe_id, false);
        let selectable = global_loaded_values.faecher.unterstufe.length > 1;
        updateDropdown(globaldata_dropdown_fach_id, global_loaded_values.faecher.unterstufe[0], false, selectable ? global_loaded_values.faecher.unterstufe : []);
        updateDropdown(globaldata_dropdown_klasse_id, global_loaded_values.klassen.unterstufe[0], false, []);
        updateDropdown(globaldata_dropdown_stufe_id, global_loaded_values.stufen[global_loaded_values.faecher.unterstufe[0]][0], false, []);
      }


    } else if (global_loaded_values.type == "multiple") {

      updateDropdown(globaldata_dropdown_fach_id, "Fach", true, global_loaded_values.faecher.unterstufe);
      updateDropdown(globaldata_dropdown_klasse_id, "Klasse", true, global_loaded_values.klassen.unterstufe);
      updateDropdown(globaldata_dropdown_stufe_id, "Stufe", true, global_loaded_values.stufen);

    } else if (global_loaded_values.type == "error") {
      //Standard Initialisierung
      updateCheckbox(globaldata_checkbox_oberstufe_id, false);
      updateDropdown(globaldata_dropdown_fach_id, "Fach", true, global_loaded_values.faecher.unterstufe);
      updateDropdown(globaldata_dropdown_klasse_id, "Klasse", true, global_loaded_values.klassen.unterstufe);
      updateDropdown(globaldata_dropdown_stufe_id, "Stufe", true, global_loaded_values.stufen);
    }
  }
}
