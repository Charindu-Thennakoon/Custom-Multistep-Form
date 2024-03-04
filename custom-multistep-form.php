<?php
/**
 * Plugin Name: Custom Multistep Form
 * Plugin URI: Custom Multistep Form
 * Description: A custom multistep form plugin with database and media library integration.
 * Version: 1.0
 * Author: Charindu
 * Author URI: https://github.com/Charindu-Thennakoon
 * License: GPL2
 */

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly.
}

// Enqueue CSS and JavaScript
function cmf_enqueue_scripts() {
    wp_enqueue_style('cmf-style', plugin_dir_url(__FILE__) . 'css/custom-multistep-form.css');
    wp_enqueue_script('cmf-script', plugin_dir_url(__FILE__) . 'js/custom-multistep-form.js', array('jquery'), null, true);

    // Localize script for AJAX URL and nonce
    wp_localize_script('cmf-script', 'cmf_ajax_obj', array( 'ajaxurl' => admin_url('admin-ajax.php'), 'nonce' => wp_create_nonce('cmf_nonce')));
}
add_action('wp_enqueue_scripts', 'cmf_enqueue_scripts',20);

// Shortcode to display form
function cmf_display_form() {
    ob_start();
    include('views/form.html'); // Path to your form HTML
    return ob_get_clean();
}
add_shortcode('custom_multistep_form', 'cmf_display_form');

// Handle AJAX form submission
function cmf_handle_form_submission() {
    check_ajax_referer('cmf_nonce', 'security');

    // Process form data and files
    $first_name = sanitize_text_field($_POST['first_name']);
    $last_name = sanitize_text_field($_POST['last_name']);
    $email = sanitize_email($_POST['email']);
    $phone = sanitize_text_field($_POST['phone']);
    $profile_image_id = cmf_process_upload('profile_image');
    $nic_pdf_id = cmf_process_upload('nic_pdf');

    // Insert into database
    global $wpdb;
    $table_name = $wpdb->prefix . 'custom_multistep_form';
    $result = $wpdb->insert($table_name, [
        'first_name' => $first_name,
        'last_name' => $last_name,
        'email' => $email,
        'phone' => $phone,
        'profile_image' => wp_get_attachment_url($profile_image_id),
        'nic_pdf' => wp_get_attachment_url($nic_pdf_id),
        'time' => current_time('mysql')
    ]);

    if ($result) {
        wp_send_json_success('Form submitted successfully.');
    } else {
        wp_send_json_error('There was an error submitting the form.');
    }
}
add_action('wp_ajax_cmf_submit_form', 'cmf_handle_form_submission');
add_action('wp_ajax_nopriv_cmf_submit_form', 'cmf_handle_form_submission');

// Handle file uploads
function cmf_process_upload($field_name) {
    require_once(ABSPATH . 'wp-admin/includes/admin.php');
    
    $uploadedfile = $_FILES[$field_name];
    $upload_overrides = ['test_form' => false];
    $movefile = wp_handle_upload($uploadedfile, $upload_overrides);

    if ($movefile && !isset($movefile['error'])) {
        // File is valid and was successfully uploaded
        $filename = $movefile['file'];
        $filetype = wp_check_filetype(basename($filename), null);
        $wp_upload_dir = wp_upload_dir();
        $attachment = array(
            'guid' => $wp_upload_dir['url'] . '/' . basename($filename), 
            'post_mime_type' => $filetype['type'],
            'post_title' => preg_replace('/\.[^.]+$/', '', basename($filename)),
            'post_content' => '',
            'post_status' => 'inherit'
        );
        $attach_id = wp_insert_attachment($attachment, $filename);
        return $attach_id;
    } else {
        // Handle error
        return false;
    }
}

// Create database table on plugin activation
function cmf_activate_plugin() {
    global $wpdb;
    $table_name = $wpdb->prefix . 'custom_multistep_form';
    $charset_collate = $wpdb->get_charset_collate();
    $sql = "CREATE TABLE $table_name (
        id mediumint(9) NOT NULL AUTO_INCREMENT,
        first_name tinytext NOT NULL,
        last_name tinytext NOT NULL,
        email text NOT NULL,
        phone text NOT NULL,
        profile_image text,
        nic_pdf text,
        time datetime DEFAULT '0000-00-00 00:00:00' NOT NULL,
        PRIMARY KEY  (id)
    ) $charset_collate;";
    require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
    dbDelta($sql);
}
register_activation_hook(__FILE__, 'cmf_activate_plugin');
