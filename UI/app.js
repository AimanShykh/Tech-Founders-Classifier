Dropzone.autoDiscover = false;

function init() {
    let dz = new Dropzone("#dropzone", {
        url: "/",
        maxFiles: 1,
        addRemoveLinks: true,
        dictDefaultMessage: "Some Message",
        autoProcessQueue: false
    });
    
    dz.on("addedfile", function() {
        if (dz.files[1] != null) {
            dz.removeFile(dz.files[0]);        
        }
    });

    dz.on("success", function(file) {
        dz.emit("complete", file);
    });

    dz.on("complete", function (file) {
        let reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = function() {
            let imageData = reader.result;

            var url = "http://127.0.0.1:5000/classify_image";

            $.post(url, {
                image_data: imageData
            }, function(data, status) {
                console.log(data);
                if (!data || data.length == 0) {
                    $("#resultHolder").hide();
                    $("#divClassTable").hide();                
                    $("#error").show();
                    return;
                }
                let players = ["elon", "jeff", "mark", "sam", "steve"];

                let match = null;
                let bestScore = -1;
                for (let i = 0; i < data.length; ++i) {
                    let maxScoreForThisClass = Math.max(...data[i].class_probability);
                    if (maxScoreForThisClass > bestScore) {
                        match = data[i];
                        bestScore = maxScoreForThisClass;
                    }
                }
                if (match) {
                    $("#error").hide();
                    $("#resultHolder").show();
                    $("#divClassTable").show();
                    $("#resultHolder").html($(`[data-player="${match.class}"]`).html());
                    let classDictionary = match.class_dictionary;
                    for (let personName in classDictionary) {
                        let index = classDictionary[personName];
                        let proabilityScore = match.class_probability[index];
                        let elementName = "#score_" + personName;
                        $(elementName).html(proabilityScore);
                    }
                }
            });
        };
    });

    $("#submitBtn").on('click', function (e) {
        dz.processQueue();		
    });
}

$(document).ready(function() {
    console.log("ready!");
    $("#error").hide();
    $("#resultHolder").hide();
    $("#divClassTable").hide();
    init();
});


