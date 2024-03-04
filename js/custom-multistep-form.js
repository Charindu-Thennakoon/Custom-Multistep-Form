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

  // $("#prevBtn").click(function () {
  //   nextPrev(-1);
  // });
  // $("#nextBtn").click(function () {
  //   nextPrev(1);
  // });

  // function validateForm() {
  //   // This function deals with validation of the form fields
  //   var x,
  //     y,
  //     i,
  //     valid = true;
  //   x = $(".tab");
  //   y = $(x[currentTab]).find("input");
  //   // A loop that checks every input field in the current tab:
  //   for (i = 0; i < y.length; i++) {
  //     // If a field is empty...
  //     if ($(y[i]).val() == "") {
  //       // add an "invalid" class to the field:
  //       $(y[i]).addClass("invalid");
  //       // and set the current valid status to false
  //       valid = false;
  //     }
  //   }
  //   return valid; // return the valid status
  // }

  function fixStepIndicator(n) {
    // This function removes the "active" class of all steps...
    $(".step").removeClass("active");
    //... and adds the "active" class on the current step:
    $($(".step")[n]).addClass("active");
  }
  function validateForm() {
    // This function deals with validation of the form fields
    var x,
      y,
      i,
      valid = true;
    x = $(".tab");
    y = $(x[currentTab]).find("input");
    // A loop that checks every input field in the current tab:
    for (i = 0; i < y.length; i++) {
      // If a field is empty...
      if ($(y[i]).val() == "") {
        // add an "invalid" class to the field:
        $(y[i]).addClass("invalid");
        // and set the current valid status to false
        valid = false;
      } else {
        $(y[i]).removeClass("invalid"); // Remove invalid class if field is not empty
      }
    }

    // Specific validation for the email field
    var email = $("input[name='email']").val();
    if (email) {
      var emailRegex =
        /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      if (!emailRegex.test(email)) {
        $("input[name='email']").addClass("invalid");
        valid = false;
      } else {
        $("input[name='email']").removeClass("invalid");
      }
    }
    // Profile image validation
    var profileImage = $("input[name='profile_image']")[0];
    if (profileImage && profileImage.files.length > 0) {
      var fileName = profileImage.files[0].name;
      var fileExtension = fileName.split(".").pop().toLowerCase();
      var allowedExtensions = ["jpeg", "jpg", "png", "webp"];

      if (!allowedExtensions.includes(fileExtension)) {
        // If the file extension is not in the allowed list, mark the input as invalid
        $(profileImage).addClass("invalid");
        valid = false;
      } else {
        // If the file is valid, ensure any invalid class is removed
        $(profileImage).removeClass("invalid");
      }
    }
    // NIC validation for .pdf format
    var nicFile = $("input[name='nic_pdf']")[0];
    if (nicFile && nicFile.files.length > 0) {
      var fileName = nicFile.files[0].name;
      var fileExtension = fileName.split(".").pop().toLowerCase();
      var allowedExtension = "pdf";

      if (fileExtension !== allowedExtension) {
        // If the file extension is not 'pdf', mark the input as invalid
        $(nicFile).addClass("invalid");
        valid = false;
      } else {
        // If the file is valid, ensure any invalid class is removed
        $(nicFile).removeClass("invalid");
      }
    }

    return valid; // return the valid status
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
          alert("Error: " + response.data.message);
        }
      },
      error: function () {
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
