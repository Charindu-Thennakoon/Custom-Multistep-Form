jQuery(document).ready(function ($) {
  var currentTab = 0; // Current tab is set to be the first tab (0)
  showTab(currentTab); // Display the current tab

  function showTab(n) {
    // This function will display the specified tab of the form...
    var x = $(".tab");
    $(x[n]).show();
    // ... and fix the Previous/Next buttons:
    if (n == 0) {
      $("#prevBtn").hide();
    } else {
      $("#prevBtn").show();
    }
    if (n == x.length - 1) {
      $("#nextBtn").text("Submit");
    } else {
      $("#nextBtn").text("Next");
    }
    // ... and run a function that will display the correct step indicator:
    fixStepIndicator(n);
  }

  function nextPrev(n) {
    // This function will figure out which tab to display
    var x = $(".tab");
    // Exit the function if any field in the current tab is invalid:
    if (n == 1 && !validateForm()) return false;
    // Hide the current tab:
    $(x[currentTab]).hide();
    // Increase or decrease the current tab by 1:
    currentTab = currentTab + n;
    // if you have reached the end of the form...
    if (currentTab >= x.length) {
      // ... the form gets submitted:
      submitForm();
      return false;
    }
    // Otherwise, display the correct tab:
    showTab(currentTab);
  }

  function validateForm() {
    // This function deals with validation of the form fields
    var valid = true;
    var x = $(".tab")[currentTab];
    var inputFields = $(x).find("input");
    //name feilds validation
    inputFields.each(function () {
      var input = $(this);
      if (
        input.attr("name") === "first_name" ||
        input.attr("name") === "last_name"
      ) {
        if (input.val().trim() === "") {
          input.addClass("invalid");
          valid = false;
        } else {
          input.removeClass("invalid");
        }
      }

      // Validate Email field
      if (input.attr("name") === "email") {
        var emailRegex =
          /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        if (!emailRegex.test(input.val())) {
          input.addClass("invalid");
          valid = false;
        } else {
          input.removeClass("invalid");
        }
      }
      // Validate Phone field
      if (input.attr("name") === "phone") {
        if (input.val().trim() === "") {
          input.addClass("invalid");
          valid = false;
        } else {
          input.removeClass("invalid");
        }
      }
      // Validate Profile Image
      if (
        input.attr("type") === "file" &&
        input.attr("name") === "profile_image"
      ) {
        if (input[0].files.length > 0) {
          var file = input[0].files[0];
          var fileType = file.type;
          var validImageTypes = [
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/webp",
          ];
          if (!validImageTypes.includes(fileType)) {
            input.addClass("invalid");
            valid = false;
          } else {
            input.removeClass("invalid");
          }
        } else {
          // If no file is selected, mark as invalid
          input.addClass("invalid");
          valid = false;
        }
      }
      // Validate NIC (PDF) field
      if (input.attr("name") === "nic_pdf") {
        if (input[0].files.length > 0) {
          var file = input[0].files[0];
          var fileName = file.name;
          var fileExtension = fileName.split(".").pop().toLowerCase();

          if (fileExtension !== "pdf") {
            // If the file extension is not PDF, mark the input as invalid
            input.addClass("invalid");
            valid = false;
          } else {
            // If the file is a PDF, remove any invalid class
            input.removeClass("invalid");
          }
        } else {
          // If no file is selected, mark as invalid
          input.addClass("invalid");
          valid = false;
        }
      }
    });

    return valid; // Return the valid status
  }

  function fixStepIndicator(n) {
    // This function removes the "active" class of all steps...
    $(".step").removeClass("active");
    //... and adds the "active" class to the current step:
    $($(".step")[n]).addClass("active");
  }

  function submitForm() {
    // Function to handle form submission via AJAX
    var formData = new FormData($("#regForm")[0]);
    formData.append("action", "cmf_submit_form"); // Action for AJAX hook
    formData.append("security", cmf_ajax_obj.nonce); // Nonce for security

    $.ajax({
      type: "POST",
      url: cmf_ajax_obj.ajaxurl,
      data: formData,
      contentType: false,
      processData: false,
      success: function (response) {
        // Assuming response.success is a boolean indicating submission status
        if (response.success) {
          alert("Form submitted successfully.");

          // Reset the form and go back to the first tab
          $("#regForm")[0].reset();
          $(".tab").hide(); // Hide all tabs
          currentTab = 0; // Reset current tab to the first tab
          showTab(currentTab); // Show the first tab
          $(".step").removeClass("finish").removeClass("active"); // Reset step indicators
          $(".step:first").addClass("active"); // Activate the first step indicator
        } else {
          // Handle submission errors or invalid data
          // Assuming response.data.message contains the error message
          alert("Error: " + response.data.message);
        }
      },
      error: function (jqXHR, textStatus, errorThrown) {
        // Handle AJAX errors
        console.error("AJAX Error: ", textStatus, errorThrown);
        alert("There was an error processing your form. Please try again.");
      },
    });
  }

  $("#prevBtn").click(function () {
    nextPrev(-1);
  });

  $("#nextBtn").click(function () {
    nextPrev(1);
  });
});
