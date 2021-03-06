class SQLHandler {

  static verifyAPIKey(api_key, onSuccess, onError) {
    Navigation.showLoader(true);

    $.get("http://api.gymlap.de/request.php", {
      key: api_key
    }, function (data, status, xhr) {
      Navigation.showLoader(false);

      if (status == "success") {
        console.log("[VERIFY_SQL_DATA]");
        console.log(data);

        if (data.success == "true") {
          onSuccess();
        } else {
          onError(data.error);
        }

      } else {
        //Connection Error
        onError("Verbindung fehlgeschlagen");
      }
    });
  }

  static updateSQLData(onSuccess, onError) {
    Navigation.showLoader(true);

    chrome.storage.sync.get({
      //Default
      apiKey: ""
    }, function (storage) {

      $.get("http://api.gymlap.de/request.php", {
        update: "true",
        key: storage.apiKey
      }, function (data, status, xhr) {
        Navigation.showLoader(false);

        if (status == "success") {
          console.log("[UPDATE_SQL_DATA]");
          console.log(data);

          onSuccess(data.changes);
        } else {
          //Connection Error
          onError("Verbindung fehlgeschlagen");
        }
      });
    });
  }

  static getSQLData(fach, klasse, stufe, onSuccess, onError) {
    Navigation.showLoader(true);

    chrome.storage.sync.get({
      //Default
      apiKey: ""
    }, function (storage) {

      $.get("http://api.gymlap.de/request.php", {
        fach: "" + encodeURIComponent(fach),
        klasse: "" + encodeURIComponent(klasse),
        stufe: "" + encodeURIComponent(stufe),
        key: storage.apiKey
      }, function (data, status, xhr) {
        Navigation.showLoader(false);

        if (status == "success") {
          console.log("[GET_SQL_DATA]");
          console.log(data);

          if (data.success == "true") {

            if (data.data.length == 0) {
              onError("Nichts gefunden");
            } else {
              onSuccess(data.data);
            }

          } else {
            onError("Ein Fehler ist aufgetreten");
          }

        } else {
          //Connection Error
          onError("Verbindung fehlgeschlagen");
        }
      });
    });

  }


  static deleteSQLData(sql_id, onReady) {
    Navigation.showLoader(true);

    chrome.storage.sync.get({
      //Default
      apiKey: ""
    }, function (storage) {

      $.get("http://api.gymlap.de/request.php", {
        id: "" + sql_id,
        key: storage.apiKey
      }, function (data, status, xhr) {
        Navigation.showLoader(false);

        if (status == "success") {
          console.log("[DELETE_SQL_DATA]");
          console.log(data);

          if (data.success == "true") {
            Navigation.showMessage("Eintrag erfolgreich gelöscht");
          } else {
            Navigation.showMessage("Löschen fehlgeschlagen");
          }
        } else {
          //Connection Error
        }

        onReady();
      });

    });

  }


  static editSQLData(sql_id, text, onReady) {
    Navigation.showLoader(true);

    chrome.storage.sync.get({
      //Default
      apiKey: ""
    }, function (storage) {

      $.get("http://api.gymlap.de/request.php", {
        id: "" + sql_id,
        text: "" + encodeURIComponent(text),
        key: storage.apiKey
      }, function (data, status, xhr) {
        Navigation.showLoader(false);

        if (status == "success") {
          console.log("[EDIT_SQL_DATA]");
          console.log(data);

          if (data.success == "true") {
            Navigation.showMessage("Eintrag erfolgreich editiert");
          } else {
            Navigation.showMessage("Editieren fehlgeschlagen");
          }
        } else {
          //Connection Error
        }

        onReady();
      });

    });

  }

  static getSQLSchoolData(school, onSuccess, onError) {
    Navigation.showLoader(true);

    chrome.storage.sync.get({
      //Default
      apiKey: ""
    }, function (storage) {

      $.get("http://api.gymlap.de/request.php", {
        school: school,
        key: storage.apiKey
      }, function (data, status, xhr) {
        Navigation.showLoader(false);

        if (status == "success") {
          console.log("[SCHOOL_DATA]");
          console.log(data);

          if (data.success == "true") {

            if (data.data.length == 0) {
              onError("Nichts gefunden");
            } else {
              onSuccess(data.data);
            }

          } else {
            onError("Ein Fehler ist aufgetreten");
          }

        } else {
          //Connection Error
          onError("Verbindung fehlgeschlagen");
        }
      });

    });
  }

  static editSQLSchoolData(school, fach, unterstufe, oberstufe, kurskuerzel, kursanzahl_11, kursanzahl_12, kursanzahl_13, onReady) {
    Navigation.showLoader(true);

    chrome.storage.sync.get({
      //Default
      apiKey: ""
    }, function (storage) {

      $.get("http://api.gymlap.de/request.php", {
        school: school,
        key: storage.apiKey,
        fach: fach,
        unterstufe: decodeURIComponent(unterstufe),
        oberstufe: decodeURIComponent(oberstufe),
        kurskuerzel: encodeURIComponent(kurskuerzel),
        kursanzahl_11: kursanzahl_11,
        kursanzahl_12: kursanzahl_12,
        kursanzahl_13: kursanzahl_13
      }, function (data, status, xhr) {
        Navigation.showLoader(false);

        if (status == "success") {
          console.log("[EDIT_SQL_SCHOOL_DATA]");
          console.log(data);

          if (data.success == "true") {
            Navigation.showMessage("Eintrag erfolgreich editiert");
          } else {
            Navigation.showMessage("Editieren fehlgeschlagen");
          }
        } else {
          //Connection Error
        }

        onReady();
      });

    });
  }

  static deleteSQLSchoolData(school, fach, onReady) {
    Navigation.showLoader(true);

    chrome.storage.sync.get({
      //Default
      apiKey: ""
    }, function (storage) {

      $.get("http://api.gymlap.de/request.php", {
        school: school,
        key: storage.apiKey,
        fach: (fach)
      }, function (data, status, xhr) {
        Navigation.showLoader(false);

        if (status == "success") {
          console.log("[DELETE_SQL_SCHOOL_DATA]");
          console.log(data);

          if (data.success == "true") {
            Navigation.showMessage("Eintrag erfolgreich gelöscht");
          } else {
            Navigation.showMessage("Löschen fehlgeschlagen");
          }
        } else {
          //Connection Error
        }

        onReady();
      });

    });
  }



  static generateSQLSchoolDataList(id_where, sql_data, active_fach, onActiveFachChanged, onUpdate) {
    $("#settings_listview").remove();
    $(id_where).append("<ul id='settings_listview' class='collapsible popout' data-collapsible='expandable'></ul>");

    for (let i = 0; i < sql_data.length; i++) {
      let head = sql_data[i].fach;

      let active = (active_fach == sql_data[i].fach);

      let fach_id = sql_data[i].fach.replace(" ", "-");

      let firstLine = "<div class='row'> <div class='col s10'> <div class='input-field'><input id='new-values-unterstufe." + fach_id + "' value='" + sql_data[i].unterstufe + "' type='text'><label class='active' for='new-values-unterstufe." + fach_id + "'>Stufen (a,b,c,d,e)</label></div> </div></div>";
      let secondLine = "<div class='row'> <div class='col s10'> <div class='input-field'><input id='new-kuerzel." + fach_id + "' value='" + decodeURIComponent(sql_data[i].kurskuerzel) + "' type='text'><label class='active' for='new-kuerzel." + fach_id + "'>Kurskürzel</label></div> </div> </div>";
      let thirdLine = "<div class='row'> <div class='col s10'> <div class='input-field'><input id='new-anzahl-11." + fach_id + "' value='" + sql_data[i].kursanzahl_11 + "' type='number'><label class='active' for='new-anzahl-11." + fach_id + "'>Kursanzahl Q11</label></div> </div> </div>";
      let fourthLine = "<div class='row'> <div class='col s10'> <div class='input-field'><input id='new-anzahl-12." + fach_id + "' value='" + sql_data[i].kursanzahl_12 + "' type='number'><label class='active' for='new-anzahl-12." + fach_id + "'>Kursanzahl Q12</label></div> </div> </div>";
      let fifthLine = "<div class='row'> <div class='col s10'> <div class='input-field'><input id='new-anzahl-13." + fach_id + "' value='" + sql_data[i].kursanzahl_13 + "' type='number'><label class='active' for='new-anzahl-13." + fach_id + "'>Kursanzahl Q13</label></div> </div> </div>";
      let sixthLine = "<div class='row'> <div class='col s3 offset-s3'> <a id=save-btn." + fach_id + " class='waves-effect waves-light btn-large green'><i class='material-icons right'>save</i>Speichern</a> </div> <div class='col s3'> <a id=del-btn." + fach_id + " class='waves-effect waves-light btn-large red'><i class='material-icons right'>delete</i>Löschen</a> </div> </div>";

      $("#settings_listview").append("<li> <div class='collapsible-header " + (active ? "active" : "") + "'><h6>" + head + "</h6> " + (active ? "<span class='new badge' data-badge-caption='changed'></span>" : "") + " </div> <div class='collapsible-body'> " + firstLine + secondLine + thirdLine + fourthLine + fifthLine + sixthLine + " </div> </li>");

      //Save button
      let v = "save-btn." + fach_id;

      document.getElementById(v).addEventListener("click", function (event) {
        //Fetch data

        let firstVal = document.getElementById("new-values-unterstufe." + fach_id).value.trim();
        let secondVal = document.getElementById("new-kuerzel." + fach_id).value.trim();
        let thirdVal = document.getElementById("new-anzahl-11." + fach_id).value.trim();
        let fourthVal = document.getElementById("new-anzahl-12." + fach_id).value.trim();
        let fifthVal = document.getElementById("new-anzahl-13." + fach_id).value.trim();

        let tempArr = [thirdVal, fourthVal, fifthVal];
        for (let j = 11; j <= 13; j++) {
          let index = sql_data[i].oberstufe.indexOf("" + j);

          if (tempArr[j - 11] <= 0 && index >= 0) {
            //Remove
            sql_data[i].oberstufe.splice(index);
          } else if (tempArr[j - 11] > 0 && index <= -1) {
            //Add
            sql_data[i].oberstufe.push("" + j);
          }
        }

        onActiveFachChanged(sql_data[i].fach);
        SQLHandler.editSQLSchoolData("gymlap", sql_data[i].fach, firstVal, sql_data[i].oberstufe, secondVal, thirdVal, fourthVal, fifthVal, onUpdate);
      });

      //Delete button
      let v2 = "del-btn." + fach_id;

      document.getElementById(v2).addEventListener("click", function (event) {
        onActiveFachChanged(sql_data[i].fach);
        SQLHandler.deleteSQLSchoolData("gymlap", sql_data[i].fach, onUpdate);
      });

    }

    //Updaten vom collapsible
    $('.collapsible').collapsible();
  }

  static generateSQLList(id_where, sql_data, active, onUpdate) {
    $("#homework_listview").remove();
    $(id_where).append("<ul id='homework_listview' class='collapsible' data-collapsible='expandable'></ul>");

    for (let i = 0; i < sql_data.length; i++) {
      let d = new Date(Number.parseInt(sql_data[i].date));
      let datestring = ("0" + d.getDate()).slice(-2) + "." + ("0" + (d.getMonth() + 1)).slice(-2) + "." + d.getFullYear();

      let head = "";
      if (sql_data[i].type == "NEXT") {
        head = "Hausaufgabe aufgegeben am <span style='color:red'>" + datestring + "</span>, Abgabe: Nächste Stunde";
      } else if (sql_data[i].type == "NEXT2") {
        head = "Hausaufgabe aufgegeben am <span style='color:red'>" + datestring + "</span>, Abgabe: Übernächste Stunde";
      } else if (sql_data[i].type == "DATE") {
        head = "Hausaufgabe/Notiz für <span style='color:red'>" + datestring + "</span>";
      }

      $("#homework_listview").append("<li> <div class='collapsible-header'" + (active ? "active" : "") + "><h6>" + head + "</h6></div> <div class='collapsible-body'> <div class='row'>   <div id='text-view." + sql_data[i].id + "' class='col s8'><span><h6>" + decodeURIComponent(sql_data[i].text) + "</h6></span></div> <div class='col s2'><a class='btn-floating waves-effect waves-light green'><i id='edit-btn." + sql_data[i].id + "' class='material-icons'>edit</i></a></div> <div class='col s2'><a class='btn-floating waves-effect waves-light red'><i id='del-btn." + sql_data[i].id + "' class='material-icons'>delete</i></a></div> </div> </div> </li>");

      //Delete button
      let v = "del-btn." + sql_data[i].id;

      document.getElementById(v).addEventListener("click", function (event) {
        let innerID = event.target.id.split(".")[1];
        SQLHandler.deleteSQLData(innerID, onUpdate);
      });

      //Edit button
      let v2 = "edit-btn." + sql_data[i].id;

      function edit(event) {
        let innerID = event.target.id.split(".")[1];
        let old_text = document.getElementById("text-view." + innerID).innerHTML.split(">")[2].split("<")[0];
        document.getElementById("edit-btn." + innerID).innerHTML = "save";
        document.getElementById("text-view." + innerID).innerHTML = "<div class='input-field'><input id='new-text." + innerID + "' value='" + old_text + "' type='text'><label class='active' for='new-text." + innerID + "'>Neuer Text</label></div>";

        document.getElementById("edit-btn." + innerID).removeEventListener("click", edit);

        document.getElementById(event.target.id).addEventListener("click", function (event) {
          let innerID2 = event.target.id.split(".")[1];
          let v3 = "new-text." + innerID2;

          SQLHandler.editSQLData(innerID2, document.getElementById(v3).value, onUpdate);
        });
      }

      document.getElementById(v2).addEventListener("click", edit);
    }

    //Updaten vom collapsible
    $('.collapsible').collapsible();
  }
}
