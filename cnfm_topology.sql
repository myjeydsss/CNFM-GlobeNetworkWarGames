-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Nov 11, 2025 at 06:23 AM
-- Server version: 10.4.28-MariaDB
-- PHP Version: 8.2.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `cnfm_topology`
--

-- --------------------------------------------------------

--
-- Table structure for table `link`
--

CREATE TABLE `link` (
  `id` int(11) NOT NULL,
  `site_id` int(11) NOT NULL,
  `linkkey` varchar(120) NOT NULL,
  `displayname` varchar(190) DEFAULT NULL,
  `fromnode` varchar(120) DEFAULT NULL,
  `tonode` varchar(120) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `link`
--

INSERT INTO `link` (`id`, `site_id`, `linkkey`, `displayname`, `fromnode`, `tonode`, `created_at`) VALUES
(138, 2, 'edge-mhbklvj7-rvsmz', '144C UG FOC', 'node-mhbkkhtx-el24d', 'node-mhbkl7cv-yt8my', '2025-11-06 02:41:23'),
(139, 2, 'edge-mhbl3m5b-zacyi', '144C UG FOC', 'ILIGAN', 'node-mhbkzwv8-icl5c', '2025-11-06 02:41:23'),
(140, 2, 'edge-mhbl3wih-ybnol', '12C UG/SUBMARINE via Manticao', 'ILIGAN', 'node-mhbl00hs-1yrjs', '2025-11-06 02:41:23'),
(141, 2, 'edge-mhbl4dqe-9v2lh', 'edge-mhbl4dqe-9v2lh', 'label-mhbl0yr5-yblk7', 'node-mhbl00hs-1yrjs', '2025-11-06 02:41:23'),
(142, 2, 'edge-mhbl4l0e-h69ia', 'edge-mhbl4l0e-h69ia', 'label-mhbl0yr5-yblk7', 'node-mhbkl7cv-yt8my', '2025-11-06 02:41:23'),
(143, 2, 'edge-mhbr3ph5-nuejq', 'edge-mhbr3ph5-nuejq', 'label-mhbkp2n6-v2uzs', 'ILIGAN', '2025-11-06 02:41:23'),
(144, 2, 'edge-mhbr3ts7-5d932', 'edge-mhbr3ts7-5d932', 'label-mhbkpr1f-83ml8', 'label-mhbkp2n6-v2uzs', '2025-11-06 02:41:23'),
(145, 2, 'edge-mhbr4ezo-x79uu', '48C UG FOC', 'ILIGAN', 'node-mhbkkhtx-el24d', '2025-11-06 02:41:23'),
(146, 2, 'edge-mhbr6uxu-ku91p', 'edge-mhbr6uxu-ku91p', 'node-mhbkkhtx-el24d', 'label-mhbl0yr5-yblk7', '2025-11-06 02:41:23'),
(147, 2, 'edge-mhbr75iv-1unu4', 'edge-mhbr75iv-1unu4', 'node-mhbkzwv8-icl5c', 'label-mhbl0yr5-yblk7', '2025-11-06 02:41:23'),
(148, 2, 'edge-mhlodg80-2cmcg', '72C AERIAL FOC', 'ILIGAN', 'node-mhbkkhtx-el24d', '2025-11-06 02:41:23'),
(312, 6, 'edge-mhskhcqk-wsmvm', 'edge-mhskhcqk-wsmvm', 'label-mhskh5oc-hvexr', 'BACOLOD', '2025-11-11 00:27:28'),
(313, 6, 'edge-mhskhe0t-x9thz', 'edge-mhskhe0t-x9thz', 'label-mhskh5ax-r3s1p', 'label-mhskh5oc-hvexr', '2025-11-11 00:27:28'),
(314, 6, 'edge-mhskpb3i-a1hw8', '144C UG/ SUBMARINE via FOBN2', 'BACOLOD', 'node-mhsklyq2-fia8q', '2025-11-11 00:27:28'),
(315, 6, 'edge-mhskpd8c-4nh5w', '144C UG & 72C Aerial FOC', 'BACOLOD', 'node-mhskm5h4-18vve', '2025-11-11 00:27:28'),
(316, 6, 'edge-mhskpeyd-axpwj', '72C Aerial & 144C UG via BSC', 'BACOLOD', 'node-mhskm39h-e5fjt', '2025-11-11 00:27:28'),
(317, 6, 'edge-mhskr8j1-33wu6', 'edge-mhskr8j1-33wu6', 'node-mhsklyq2-fia8q', 'label-mhskqo2h-csrod', '2025-11-11 00:27:28'),
(318, 6, 'edge-mhskrbln-yjwr7', 'edge-mhskrbln-yjwr7', 'node-mhskm5h4-18vve', 'label-mhskqo2h-csrod', '2025-11-11 00:27:28'),
(319, 6, 'edge-mhsksj5a-oxloj', 'edge-mhsksj5a-oxloj', 'node-mhskm39h-e5fjt', 'label-mhskqo2h-csrod', '2025-11-11 00:27:28'),
(320, 1, 'edge-mhio6kn2-ml693', 'edge-mhio6kn2-ml693', 'label-mhio60jb-dj68f', 'DAVAO', '2025-11-11 00:28:31'),
(321, 1, 'edge-mhio6s51-w5cbq', 'edge-mhio6s51-w5cbq', 'label-mhio602o-j8j4t', 'label-mhio60jb-dj68f', '2025-11-11 00:28:31'),
(322, 1, 'edge-mhip97un-mwlbb', '144FKC-GLOBE HYBRID', 'DAVAO', 'node-mhip4czc-b4zky', '2025-11-11 00:28:31'),
(323, 1, 'edge-mhip9j9a-ontz5', '144FKC-TELIC PHIL HYBRID', 'DAVAO', 'node-mhip4czc-b4zky', '2025-11-11 00:28:31'),
(324, 1, 'edge-mhipv0lv-48b2y', '144GLOBE FOC-DIGOS', 'DAVAO', 'node-mhbqzvjk-wruc1', '2025-11-11 00:28:31'),
(325, 1, 'edge-mhipvmq5-aw58y', '144FKC-DIGOS', 'DAVAO', 'node-mhbqzvjk-wruc1', '2025-11-11 00:28:31'),
(326, 1, 'edge-mhipwzk0-tv7s6', '144FKC-GLOBE HYBRID', 'DAVAO', 'node-mhbr01ax-02svd', '2025-11-11 00:28:31'),
(327, 1, 'edge-mhiq4mrq-fdcni', 'edge-mhiq4mrq-fdcni', 'node-mhip4czc-b4zky', 'label-mhiq0kdd-mzrok', '2025-11-11 00:28:31'),
(328, 1, 'edge-mhiq4rre-ykvvq', 'edge-mhiq4rre-ykvvq', 'node-mhbr01ax-02svd', 'label-mhiq0kdd-mzrok', '2025-11-11 00:28:31'),
(329, 1, 'edge-mhiq5nrp-sxd11', 'edge-mhiq5nrp-sxd11', 'node-mhbqzvjk-wruc1', 'label-mhiq0kdd-mzrok', '2025-11-11 00:28:31'),
(370, 3, 'edge-mhlou18y-gfcph', 'edge-mhlou18y-gfcph', 'label-mhlotqvt-mar85', 'label-mhlotj9q-iclyk', '2025-11-11 02:55:17'),
(371, 3, 'edge-mhlou7z3-ladrc', 'edge-mhlou7z3-ladrc', 'label-mhlotj9q-iclyk', 'MARAMAG', '2025-11-11 02:55:17'),
(372, 3, 'edge-mhlowqhf-tvadj', '144C UG FOC', 'MARAMAG', 'node-mhlow2la-2u42e', '2025-11-11 02:55:17'),
(373, 3, 'edge-mhlox7y4-dewdk', '144C UG FOC', 'MARAMAG', 'node-mhlovxbg-7sjbf', '2025-11-11 02:55:17'),
(374, 3, 'edge-mhloxht7-0u8ni', '72C Aerial FOC', 'MARAMAG', 'node-mhlovxbg-7sjbf', '2025-11-11 02:55:17'),
(375, 3, 'edge-mhloxovv-hxnn7', '144C UG FOC', 'MARAMAG', 'node-mhlow4oq-126ct', '2025-11-11 02:55:17'),
(376, 3, 'edge-mhloxtbk-wm6bn', '24C Aerial FOC', 'MARAMAG', 'node-mhlow4oq-126ct', '2025-11-11 02:55:17'),
(377, 3, 'edge-mhlp05h8-xggld', 'edge-mhlp05h8-xggld', 'node-mhlovxbg-7sjbf', 'label-mhlozpzc-x66ju', '2025-11-11 02:55:17'),
(378, 3, 'edge-mhlp099b-cuqq9', 'edge-mhlp099b-cuqq9', 'node-mhlow4oq-126ct', 'label-mhlozpzc-x66ju', '2025-11-11 02:55:17'),
(379, 3, 'edge-mhlp0beo-h6vpe', 'edge-mhlp0beo-h6vpe', 'node-mhlow2la-2u42e', 'label-mhlozpzc-x66ju', '2025-11-11 02:55:17'),
(391, 7, 'edge-mhsrs3tf-tqeru', '48C AERIAL', 'ORMOR', 'node-mhsrrdc6-b6twf', '2025-11-11 04:37:44'),
(392, 7, 'edge-mhsrsz9r-zqrh8', '48C UG', 'ORMOR', 'node-mhsrrdc6-b6twf', '2025-11-11 04:37:44'),
(393, 7, 'edge-mhsrvgxy-vvn4v', '144C UG', 'ORMOR', 'node-mhsrrhhq-liye6', '2025-11-11 04:37:44'),
(394, 7, 'edge-mhsrx8f4-kx10l', '48C AERIAL', 'ORMOR', 'node-mhsrrhhq-liye6', '2025-11-11 04:37:44'),
(395, 7, 'edge-mhsrzwnf-vbjk2', 'edge-mhsrzwnf-vbjk2', 'node-mhsrrdc6-b6twf', 'node-mhsrzm7i-xl6dh', '2025-11-11 04:37:44'),
(396, 7, 'edge-mhsrzyrc-avy6y', 'edge-mhsrzyrc-avy6y', 'node-mhsrrhhq-liye6', 'node-mhsrzq4p-nmw6q', '2025-11-11 04:37:44'),
(397, 7, 'edge-mhss10n8-9lxf8', 'edge-mhss10n8-9lxf8', 'node-mhsrzm7i-xl6dh', 'label-mhss0hnw-mam4e', '2025-11-11 04:37:44'),
(398, 7, 'edge-mhss13cw-5vsx9', 'edge-mhss13cw-5vsx9', 'node-mhsrzq4p-nmw6q', 'label-mhss0owj-4oc92', '2025-11-11 04:37:44'),
(399, 7, 'edge-mhss1gm9-qgjf4', 'edge-mhss1gm9-qgjf4', 'label-mhss0hnw-mam4e', 'label-mhss0owj-4oc92', '2025-11-11 04:37:44'),
(400, 7, 'edge-mhss28sj-guzxu', 'edge-mhss28sj-guzxu', 'label-mhsrqtr5-fa2lt', 'ORMOR', '2025-11-11 04:37:44'),
(401, 7, 'edge-mhss2b7k-apojo', 'edge-mhss2b7k-apojo', 'label-mhsrqyof-tke7y', 'label-mhsrqtr5-fa2lt', '2025-11-11 04:37:44');

-- --------------------------------------------------------

--
-- Table structure for table `linklabel`
--

CREATE TABLE `linklabel` (
  `id` int(11) NOT NULL,
  `site_id` int(11) NOT NULL,
  `linkid` int(11) DEFAULT NULL,
  `node_code` varchar(120) DEFAULT NULL,
  `node_name` varchar(180) DEFAULT NULL,
  `type` enum('node','label') DEFAULT 'node',
  `x` decimal(10,2) DEFAULT 0.00,
  `y` decimal(10,2) DEFAULT 0.00,
  `width` decimal(10,2) DEFAULT 150.00,
  `height` decimal(10,2) DEFAULT 60.00,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `linklabel`
--

INSERT INTO `linklabel` (`id`, `site_id`, `linkid`, `node_code`, `node_name`, `type`, `x`, `y`, `width`, `height`, `created_at`) VALUES
(89, 2, NULL, 'node-mhbkkhtx-el24d', 'TUBOD', 'node', 258.62, -171.64, 150.00, 60.00, '2025-11-06 02:41:23'),
(90, 2, NULL, 'node-mhbkl7cv-yt8my', 'PAGADIAN', 'node', 666.41, -168.21, 150.00, 60.00, '2025-11-06 02:41:23'),
(91, 2, NULL, 'label-mhbkp2n6-v2uzs', 'IPCORE Network', 'label', -204.81, 82.72, 164.00, 60.00, '2025-11-06 02:41:23'),
(92, 2, NULL, 'label-mhbkpr1f-83ml8', 'CORE NEs', 'label', -197.72, 215.97, 150.00, 60.00, '2025-11-06 02:41:23'),
(93, 2, NULL, 'node-mhbkzwv8-icl5c', 'CDO', 'node', 332.74, 10.39, 150.00, 60.00, '2025-11-06 02:41:23'),
(94, 2, NULL, 'node-mhbl00hs-1yrjs', 'DAUIN', 'node', 258.76, 205.23, 150.00, 60.00, '2025-11-06 02:41:23'),
(95, 2, NULL, 'label-mhbl0yr5-yblk7', 'The Rest of South Luzon, Visayas, and Mindanao Network', 'label', 767.30, 1.82, 182.00, 91.00, '2025-11-06 02:41:23'),
(218, 6, NULL, 'label-mhskh5ax-r3s1p', 'CORE NEs', 'label', -139.57, 205.70, 140.00, 67.00, '2025-11-11 00:27:28'),
(219, 6, NULL, 'label-mhskh5oc-hvexr', 'IPCODE Network', 'label', -139.88, 101.31, 140.00, 69.00, '2025-11-11 00:27:28'),
(220, 6, NULL, 'node-mhsklyq2-fia8q', 'JMBASA', 'node', 479.23, -177.77, 190.00, 80.00, '2025-11-11 00:27:28'),
(221, 6, NULL, 'node-mhskm39h-e5fjt', 'KABANLAKAN', 'node', 482.31, 1.23, 190.00, 80.00, '2025-11-11 00:27:28'),
(222, 6, NULL, 'node-mhskm5h4-18vve', 'CADIZ', 'node', 482.23, 203.99, 190.00, 80.00, '2025-11-11 00:27:28'),
(223, 6, NULL, 'label-mhskqo2h-csrod', 'The Rest of South Luzon, Visayas, and Mindanao Network', 'label', 896.96, -12.48, 200.00, 70.00, '2025-11-11 00:27:28'),
(224, 1, NULL, 'node-mhbqzvjk-wruc1', 'DIGOS', 'node', -303.12, 351.89, 150.00, 60.00, '2025-11-11 00:28:31'),
(225, 1, NULL, 'node-mhbr01ax-02svd', 'TAGUM', 'node', -22.07, 476.30, 150.00, 60.00, '2025-11-11 00:28:31'),
(226, 1, NULL, 'label-mhio602o-j8j4t', 'CORE NEs', 'label', -748.63, 448.61, 150.00, 60.00, '2025-11-11 00:28:31'),
(227, 1, NULL, 'label-mhio60jb-dj68f', 'IPCORE Network', 'label', -749.54, 309.69, 151.00, 60.00, '2025-11-11 00:28:31'),
(228, 1, NULL, 'node-mhip4czc-b4zky', 'QUEZON', 'node', -20.97, 40.24, 150.00, 60.00, '2025-11-11 00:28:31'),
(229, 1, NULL, 'node-mhip5amw-wq94b', 'BAGANI', 'node', -327.06, 43.44, 150.00, 60.00, '2025-11-11 00:28:31'),
(230, 1, NULL, 'label-mhiq0kdd-mzrok', 'The Rest of South Luzon, Visayas, and Mindanao Network', 'label', 169.95, 249.78, 185.00, 60.00, '2025-11-11 00:28:31'),
(231, 1, NULL, 'node-mhsjz4om-mljge', 'MATINA', 'node', -271.58, 473.33, 142.00, 80.00, '2025-11-11 00:28:31'),
(256, 3, NULL, 'label-mhlotj9q-iclyk', 'IPCORE Network', 'label', -124.50, 91.50, 154.00, 70.00, '2025-11-11 02:55:17'),
(257, 3, NULL, 'label-mhlotqvt-mar85', 'CORE NEs', 'label', -122.58, 193.91, 140.00, 60.00, '2025-11-11 02:55:17'),
(258, 3, NULL, 'node-mhlovxbg-7sjbf', 'MALAYBALAY', 'node', 437.06, -174.47, 190.00, 80.00, '2025-11-11 02:55:17'),
(259, 3, NULL, 'node-mhlow2la-2u42e', 'MLANG', 'node', 435.81, -0.03, 190.00, 80.00, '2025-11-11 02:55:17'),
(260, 3, NULL, 'node-mhlow4oq-126ct', 'QUEZON', 'node', 433.11, 200.49, 190.00, 80.00, '2025-11-11 02:55:17'),
(261, 3, NULL, 'label-mhlozpzc-x66ju', 'The Rest of South Luzon, Visayas, and Mindanao Network', 'label', 793.35, -10.36, 200.00, 70.00, '2025-11-11 02:55:17'),
(270, 7, NULL, 'label-mhsrqtr5-fa2lt', 'IPCORE NETWORK', 'label', -182.00, 102.27, 200.00, 70.00, '2025-11-11 04:37:44'),
(271, 7, NULL, 'label-mhsrqyof-tke7y', 'CORE NEs', 'label', -182.33, 225.27, 200.00, 70.00, '2025-11-11 04:37:44'),
(272, 7, NULL, 'node-mhsrrdc6-b6twf', 'TACLOBAN', 'node', 339.97, -156.16, 190.00, 80.00, '2025-11-11 04:37:44'),
(273, 7, NULL, 'node-mhsrrhhq-liye6', 'MAASIN', 'node', 337.12, 191.74, 190.00, 80.00, '2025-11-11 04:37:44'),
(274, 7, NULL, 'node-mhsrzm7i-xl6dh', 'CALBAYOG', 'node', 651.32, -155.52, 190.00, 80.00, '2025-11-11 04:37:44'),
(275, 7, NULL, 'node-mhsrzq4p-nmw6q', 'TABILARAN', 'node', 656.31, 191.05, 190.00, 80.00, '2025-11-11 04:37:44'),
(276, 7, NULL, 'label-mhss0hnw-mam4e', 'FOBN1 NETWORK, (Eastern Visayas, South Luzon & Mindanao Network)', 'label', 972.31, -193.36, 160.00, 64.00, '2025-11-11 04:37:44'),
(277, 7, NULL, 'label-mhss0owj-4oc92', 'FOBN2 NETWORK, (Western Visayas, South Luzon & Mindanao Network)', 'label', 969.38, 161.69, 166.00, 60.00, '2025-11-11 04:37:44');

-- --------------------------------------------------------

--
-- Table structure for table `linkload`
--

CREATE TABLE `linkload` (
  `id` int(11) NOT NULL,
  `linkid` int(11) NOT NULL,
  `loadtag` varchar(180) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `linkload`
--

INSERT INTO `linkload` (`id`, `linkid`, `loadtag`, `created_at`) VALUES
(170, 138, 'DWDM MAIN', '2025-11-06 02:41:23'),
(171, 138, 'DODRIO/Nokia', '2025-11-06 02:41:23'),
(172, 138, 'DWDM SPAN', '2025-11-06 02:41:23'),
(173, 139, 'DWDM LAYER 1 MAIN', '2025-11-06 02:41:23'),
(174, 139, 'DWDM LAYER 2 MAIN', '2025-11-06 02:41:23'),
(175, 139, 'GALACTUS EP', '2025-11-06 02:41:23'),
(176, 139, 'DODRIO/Nokia', '2025-11-06 02:41:23'),
(177, 139, 'CDO-TUBOG COHERENT (BYPASS)', '2025-11-06 02:41:23'),
(178, 139, 'DWDM LAYER 1 SPAN', '2025-11-06 02:41:23'),
(179, 139, 'DWDM LAYER 2 SPAN', '2025-11-06 02:41:23'),
(180, 140, 'DWDM', '2025-11-06 02:41:23'),
(181, 140, 'COHERENT', '2025-11-06 02:41:23'),
(182, 145, 'DWDM MAIN', '2025-11-06 02:41:23'),
(183, 145, 'GALACTUS EP', '2025-11-06 02:41:23'),
(184, 145, 'DODRIO/Nokia', '2025-11-06 02:41:23'),
(185, 145, 'CDO-TUBOD COHERENT (BYPASS)', '2025-11-06 02:41:23'),
(186, 148, 'DWDM', '2025-11-06 02:41:23'),
(187, 148, 'DODRIO/Nokia', '2025-11-06 02:41:23'),
(188, 148, 'DWDM SPAN', '2025-11-06 02:41:23'),
(369, 314, 'DWDM LAYER 1', '2025-11-11 00:27:28'),
(370, 314, 'DWDM LAYER 2', '2025-11-11 00:27:28'),
(371, 314, 'COHERENT', '2025-11-11 00:27:28'),
(372, 314, 'GALACTUS DP', '2025-11-11 00:27:28'),
(373, 314, 'GALACTUS EP', '2025-11-11 00:27:28'),
(374, 314, 'DODRIO/Nokia', '2025-11-11 00:27:28'),
(375, 315, 'DWDM LAYER 1', '2025-11-11 00:27:28'),
(376, 315, 'DWDM LAYER 2', '2025-11-11 00:27:28'),
(377, 315, 'COHERENT', '2025-11-11 00:27:28'),
(378, 315, 'GALACTUS DP', '2025-11-11 00:27:28'),
(379, 316, 'GALACTUS DP', '2025-11-11 00:27:28'),
(380, 322, 'GALACTUS EP', '2025-11-11 00:28:31'),
(381, 323, 'GALACTUS DP', '2025-11-11 00:28:31'),
(382, 323, 'COHERENT', '2025-11-11 00:28:31'),
(383, 323, 'DODRIO/Nokia', '2025-11-11 00:28:31'),
(384, 324, 'GALACTUS EP', '2025-11-11 00:28:31'),
(385, 325, 'DODRIO/Nokia', '2025-11-11 00:28:31'),
(386, 325, 'COHERENT', '2025-11-11 00:28:31'),
(387, 326, 'GALACTUS DP', '2025-11-11 00:28:31'),
(388, 326, 'GALACTUS EP', '2025-11-11 00:28:31'),
(389, 326, 'COHERENT', '2025-11-11 00:28:31'),
(390, 326, 'DODRIO/Nokia', '2025-11-11 00:28:31'),
(452, 372, 'DODRIO/Nokia', '2025-11-11 02:55:17'),
(453, 372, 'GALACTUS DP', '2025-11-11 02:55:17'),
(454, 372, 'COHERENT', '2025-11-11 02:55:17'),
(455, 373, 'DODRIO/Nokia', '2025-11-11 02:55:17'),
(456, 373, 'DWDM MAIN', '2025-11-11 02:55:17'),
(457, 373, 'COHERENT', '2025-11-11 02:55:17'),
(458, 373, 'GALACTUS DP', '2025-11-11 02:55:17'),
(459, 373, 'GALACTUS EP', '2025-11-11 02:55:17'),
(460, 374, 'DWDM SPAN', '2025-11-11 02:55:17'),
(461, 375, 'DODRIO/Nokia', '2025-11-11 02:55:17'),
(462, 375, 'DWDM MAIN', '2025-11-11 02:55:17'),
(463, 375, 'GALACTUS EP', '2025-11-11 02:55:17'),
(464, 376, 'COHERENT', '2025-11-11 02:55:17'),
(465, 376, 'DWDM SPAN', '2025-11-11 02:55:17'),
(466, 376, 'GALACTUS DP', '2025-11-11 02:55:17'),
(477, 391, 'DODRIO/Nokia', '2025-11-11 04:37:44'),
(478, 392, 'DWDM LAYER 1', '2025-11-11 04:37:44'),
(479, 392, 'DWDM LAYER 2', '2025-11-11 04:37:44'),
(480, 392, 'COHERENT', '2025-11-11 04:37:44'),
(481, 392, 'GALACTUS DP', '2025-11-11 04:37:44'),
(482, 393, 'DWDM LAYER 1', '2025-11-11 04:37:44'),
(483, 393, 'DWDM LAYER 2', '2025-11-11 04:37:44'),
(484, 393, 'DODRIO/Nokia', '2025-11-11 04:37:44'),
(485, 394, 'COHERENT', '2025-11-11 04:37:44'),
(486, 394, 'GALACTUS EP', '2025-11-11 04:37:44');

-- --------------------------------------------------------

--
-- Table structure for table `linksegment`
--

CREATE TABLE `linksegment` (
  `id` int(11) NOT NULL,
  `linkid` int(11) NOT NULL,
  `segorder` int(11) DEFAULT 0,
  `pathd` text NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `linksegment`
--

INSERT INTO `linksegment` (`id`, `linkid`, `segorder`, `pathd`, `description`, `created_at`) VALUES
(138, 138, 0, 'M 333.62 -141.64 L 741.41 -138.21', '{\"type\":\"bezier\",\"animated\":true}', '2025-11-06 02:41:23'),
(139, 139, 0, 'M 43.27 38.73 L 407.74 40.39', '{\"type\":\"bezier\",\"animated\":true}', '2025-11-06 02:41:23'),
(140, 140, 0, 'M 43.27 38.73 L 333.76 235.23', '{\"type\":\"smoothstep\",\"animated\":true}', '2025-11-06 02:41:23'),
(141, 141, 0, 'M 858.30 47.32 L 333.76 235.23', '{\"type\":\"smoothstep\",\"animated\":false}', '2025-11-06 02:41:23'),
(142, 142, 0, 'M 858.30 47.32 L 741.41 -138.21', '{\"type\":\"smoothstep\",\"animated\":false}', '2025-11-06 02:41:23'),
(143, 143, 0, 'M -122.81 112.72 L 43.27 38.73', '{\"type\":\"smoothstep\",\"animated\":false}', '2025-11-06 02:41:23'),
(144, 144, 0, 'M -122.72 245.97 L -122.81 112.72', '{\"type\":\"smoothstep\",\"animated\":false}', '2025-11-06 02:41:23'),
(145, 145, 0, 'M 43.27 38.73 L 333.62 -141.64', '{\"type\":\"bezier\",\"animated\":true}', '2025-11-06 02:41:23'),
(146, 146, 0, 'M 333.62 -141.64 L 858.30 47.32', '{\"type\":\"bezier\",\"animated\":false}', '2025-11-06 02:41:23'),
(147, 147, 0, 'M 407.74 40.39 L 858.30 47.32', '{\"type\":\"bezier\",\"animated\":false}', '2025-11-06 02:41:23'),
(148, 148, 0, 'M 43.27 38.73 L 333.62 -141.64', '{\"type\":\"smoothstep\",\"animated\":true}', '2025-11-06 02:41:23'),
(312, 312, 0, 'M -69.88 135.81 L 75.00 30.00', '{\"type\":\"smoothstep\",\"animated\":false}', '2025-11-11 00:27:28'),
(313, 313, 0, 'M -69.57 239.20 L -69.88 135.81', '{\"type\":\"straight\",\"animated\":false}', '2025-11-11 00:27:28'),
(314, 314, 0, 'M 75.00 30.00 L 574.23 -137.77', '{\"type\":\"smoothstep\",\"animated\":true}', '2025-11-11 00:27:28'),
(315, 315, 0, 'M 75.00 30.00 L 577.23 243.99', '{\"type\":\"smoothstep\",\"animated\":true}', '2025-11-11 00:27:28'),
(316, 316, 0, 'M 75.00 30.00 L 577.31 41.23', '{\"type\":\"bezier\",\"animated\":true}', '2025-11-11 00:27:28'),
(317, 317, 0, 'M 574.23 -137.77 L 996.96 22.52', '{\"type\":\"smoothstep\",\"animated\":false}', '2025-11-11 00:27:28'),
(318, 318, 0, 'M 577.23 243.99 L 996.96 22.52', '{\"type\":\"smoothstep\",\"animated\":false}', '2025-11-11 00:27:28'),
(319, 319, 0, 'M 577.31 41.23 L 996.96 22.52', '{\"type\":\"bezier\",\"animated\":false}', '2025-11-11 00:27:28'),
(320, 320, 0, 'M -674.04 339.69 L -552.56 240.25', '{\"type\":\"smoothstep\",\"animated\":false}', '2025-11-11 00:28:31'),
(321, 321, 0, 'M -673.63 478.61 L -674.04 339.69', '{\"type\":\"straight\",\"animated\":false}', '2025-11-11 00:28:31'),
(322, 322, 0, 'M -552.56 240.25 L 54.03 70.24', '{\"type\":\"smoothstep\",\"animated\":true}', '2025-11-11 00:28:31'),
(323, 323, 0, 'M -552.56 240.25 L 54.03 70.24', '{\"type\":\"smoothstep\",\"animated\":true}', '2025-11-11 00:28:31'),
(324, 324, 0, 'M -552.56 240.25 L -228.12 381.89', '{\"type\":\"bezier\",\"animated\":true}', '2025-11-11 00:28:31'),
(325, 325, 0, 'M -552.56 240.25 L -228.12 381.89', '{\"type\":\"bezier\",\"animated\":true}', '2025-11-11 00:28:31'),
(326, 326, 0, 'M -552.56 240.25 L 52.93 506.30', '{\"type\":\"smoothstep\",\"animated\":true}', '2025-11-11 00:28:31'),
(327, 327, 0, 'M 54.03 70.24 L 262.45 279.78', '{\"type\":\"smoothstep\",\"animated\":false}', '2025-11-11 00:28:31'),
(328, 328, 0, 'M 52.93 506.30 L 262.45 279.78', '{\"type\":\"smoothstep\",\"animated\":false}', '2025-11-11 00:28:31'),
(329, 329, 0, 'M -228.12 381.89 L 262.45 279.78', '{\"type\":\"bezier\",\"animated\":false}', '2025-11-11 00:28:31'),
(370, 370, 0, 'M -52.58 223.91 L -47.50 126.50', '{\"type\":\"straight\",\"animated\":false}', '2025-11-11 02:55:17'),
(371, 371, 0, 'M -47.50 126.50 L 89.03 30.00', '{\"type\":\"smoothstep\",\"animated\":false}', '2025-11-11 02:55:17'),
(372, 372, 0, 'M 89.03 30.00 L 530.81 39.97', '{\"type\":\"bezier\",\"animated\":true}', '2025-11-11 02:55:17'),
(373, 373, 0, 'M 89.03 30.00 L 532.06 -134.47', '{\"type\":\"bezier\",\"animated\":true}', '2025-11-11 02:55:17'),
(374, 374, 0, 'M 89.03 30.00 L 532.06 -134.47', '{\"type\":\"smoothstep\",\"animated\":true}', '2025-11-11 02:55:17'),
(375, 375, 0, 'M 89.03 30.00 L 528.11 240.49', '{\"type\":\"bezier\",\"animated\":true}', '2025-11-11 02:55:17'),
(376, 376, 0, 'M 89.03 30.00 L 528.11 240.49', '{\"type\":\"smoothstep\",\"animated\":true}', '2025-11-11 02:55:17'),
(377, 377, 0, 'M 532.06 -134.47 L 893.35 24.64', '{\"type\":\"smoothstep\",\"animated\":false}', '2025-11-11 02:55:17'),
(378, 378, 0, 'M 528.11 240.49 L 893.35 24.64', '{\"type\":\"smoothstep\",\"animated\":false}', '2025-11-11 02:55:17'),
(379, 379, 0, 'M 530.81 39.97 L 893.35 24.64', '{\"type\":\"bezier\",\"animated\":false}', '2025-11-11 02:55:17'),
(391, 391, 0, 'M 73.63 28.63 L 434.97 -116.16', '{\"type\":\"smoothstep\",\"animated\":true}', '2025-11-11 04:37:44'),
(392, 392, 0, 'M 73.63 28.63 L 434.97 -116.16', '{\"type\":\"bezier\",\"animated\":true}', '2025-11-11 04:37:44'),
(393, 393, 0, 'M 73.63 28.63 L 432.12 231.74', '{\"type\":\"smoothstep\",\"animated\":true}', '2025-11-11 04:37:44'),
(394, 394, 0, 'M 73.63 28.63 L 432.12 231.74', '{\"type\":\"bezier\",\"animated\":true}', '2025-11-11 04:37:44'),
(395, 395, 0, 'M 434.97 -116.16 L 746.32 -115.52', '{\"type\":\"straight\",\"animated\":false}', '2025-11-11 04:37:44'),
(396, 396, 0, 'M 432.12 231.74 L 751.31 231.05', '{\"type\":\"straight\",\"animated\":false}', '2025-11-11 04:37:44'),
(397, 397, 0, 'M 746.32 -115.52 L 1052.31 -161.36', '{\"type\":\"straight\",\"animated\":false}', '2025-11-11 04:37:44'),
(398, 398, 0, 'M 751.31 231.05 L 1052.38 191.69', '{\"type\":\"straight\",\"animated\":false}', '2025-11-11 04:37:44'),
(399, 399, 0, 'M 1052.31 -161.36 L 1052.38 191.69', '{\"type\":\"straight\",\"animated\":false}', '2025-11-11 04:37:44'),
(400, 400, 0, 'M -82.00 137.27 L 73.63 28.63', '{\"type\":\"smoothstep\",\"animated\":false}', '2025-11-11 04:37:44'),
(401, 401, 0, 'M -82.33 260.27 L -82.00 137.27', '{\"type\":\"straight\",\"animated\":false}', '2025-11-11 04:37:44');

-- --------------------------------------------------------

--
-- Table structure for table `region`
--

CREATE TABLE `region` (
  `id` int(11) NOT NULL,
  `code` varchar(32) NOT NULL,
  `name` varchar(120) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `region`
--

INSERT INTO `region` (`id`, `code`, `name`, `created_at`, `updated_at`) VALUES
(1, 'LUZON', 'Luzon', '2025-10-28 06:43:49', '2025-10-28 06:43:49'),
(2, 'VISAYAS', 'Visayas', '2025-10-28 06:43:49', '2025-10-28 06:43:49'),
(3, 'MINDANAO', 'Mindanao', '2025-10-28 06:43:49', '2025-10-28 06:43:49');

-- --------------------------------------------------------

--
-- Table structure for table `site`
--

CREATE TABLE `site` (
  `id` int(11) NOT NULL,
  `region_id` int(11) NOT NULL,
  `code` varchar(64) NOT NULL,
  `name` varchar(180) NOT NULL,
  `x` decimal(10,2) DEFAULT 0.00,
  `y` decimal(10,2) DEFAULT 0.00,
  `width` decimal(10,2) DEFAULT 150.00,
  `height` decimal(10,2) DEFAULT 60.00,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `site`
--

INSERT INTO `site` (`id`, `region_id`, `code`, `name`, `x`, `y`, `width`, `height`, `created_at`, `updated_at`) VALUES
(1, 3, 'DAVAO', 'Davao', -627.56, 210.25, 150.00, 60.00, '2025-10-28 07:01:42', '2025-11-11 00:28:31'),
(2, 3, 'ILIGAN', 'Iligan', -31.73, 8.73, 150.00, 60.00, '2025-10-28 07:01:42', '2025-11-06 02:41:23'),
(3, 3, 'MARAMAG', 'Maramag', 14.03, 0.00, 150.00, 60.00, '2025-11-04 15:22:17', '2025-11-11 02:55:17'),
(5, 3, 'BUTUAN', 'Butuan', 0.00, 0.00, 150.00, 60.00, '2025-11-10 02:56:26', '2025-11-10 02:56:26'),
(6, 2, 'BACOLOD', 'Bacolod', 0.00, 0.00, 150.00, 60.00, '2025-11-10 03:12:27', '2025-11-11 00:27:28'),
(7, 2, 'ORMOC', 'Ormoc', -1.37, -1.37, 150.00, 60.00, '2025-11-10 06:35:48', '2025-11-11 04:37:44'),
(8, 3, 'CDO', 'CDO', 0.00, 0.00, 150.00, 60.00, '2025-11-11 01:10:52', '2025-11-11 01:10:52');

-- --------------------------------------------------------

--
-- Table structure for table `siteservice`
--

CREATE TABLE `siteservice` (
  `id` int(11) NOT NULL,
  `site_id` int(11) NOT NULL,
  `name` varchar(180) NOT NULL,
  `sort_order` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `siteservice`
--

INSERT INTO `siteservice` (`id`, `site_id`, `name`, `sort_order`, `created_at`) VALUES
(1, 2, '2G, 4G, LTE, 5G: DATA, SMS, VOICE', 0, '2025-11-06 03:01:25'),
(2, 2, 'MOBILE BROADBAND', 1, '2025-11-06 03:01:35'),
(3, 2, 'FIXED BROADBAND', 2, '2025-11-06 03:01:44'),
(4, 1, '2G, 4G, LTE, 5G: DATA, SMS, VOICE', 0, '2025-11-06 03:32:04'),
(5, 1, 'VoLTE / VoWifi / MOBILE BROADBAND', 1, '2025-11-06 03:32:29'),
(6, 1, 'FIXED BROADBAND', 2, '2025-11-06 03:32:37'),
(7, 1, '4G/5G INBOUND AND OUTBOUND ROAMING', 3, '2025-11-06 03:32:53'),
(8, 1, 'SUBSCRIBER PROVISIONING AND DB', 4, '2025-11-06 03:33:01'),
(9, 1, 'VOLTE SUPPLEMENTARY Services', 5, '2025-11-06 03:33:11'),
(10, 1, 'International Circuits', 6, '2025-11-06 03:33:24'),
(11, 6, '2G, 4G, LTE, 5G- DATA, SMS, VOICE', 0, '2025-11-10 03:36:59'),
(12, 6, 'VoLTE / VoWifi / MOBILE BROADBAND', 1, '2025-11-10 03:37:08'),
(13, 6, '4G/5G INBOUND AND OUTBOUND ROAMING', 2, '2025-11-10 03:37:18'),
(15, 6, 'WIRELESS DATA', 3, '2025-11-10 03:43:45'),
(16, 7, '2G, 4G, LTE, 5G - DATA, SMS, VOICE', 0, '2025-11-10 06:38:49'),
(17, 7, 'VoLTE / VoWifi / MOBILE BROADBAND', 1, '2025-11-10 06:38:57'),
(18, 7, 'FIXED BROADBAND', 2, '2025-11-10 06:47:43');

-- --------------------------------------------------------

--
-- Table structure for table `site_admins`
--

CREATE TABLE `site_admins` (
  `id` int(10) UNSIGNED NOT NULL,
  `site_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `assigned_by` int(11) DEFAULT NULL,
  `is_primary` tinyint(1) NOT NULL DEFAULT 0,
  `assigned_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `revoked_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `staticpath`
--

CREATE TABLE `staticpath` (
  `id` int(11) NOT NULL,
  `site_id` int(11) NOT NULL,
  `pathd` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `topologydraft`
--

CREATE TABLE `topologydraft` (
  `site_id` int(11) NOT NULL,
  `payload` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`payload`)),
  `meta` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`meta`)),
  `updated_by` int(11) DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `topologydraft`
--

INSERT INTO `topologydraft` (`site_id`, `payload`, `meta`, `updated_by`, `updated_at`, `created_at`) VALUES
(1, '{\"nodes\":[{\"id\":\"DAVAO\",\"label\":\"DAVAO\",\"x\":-627.5560872203057,\"y\":210.24819698372534,\"color\":\"#1d4ed8\",\"width\":150,\"height\":60,\"kind\":\"core\"},{\"id\":\"node-mhbqzvjk-wruc1\",\"label\":\"DIGOS\",\"x\":-303.1171630755433,\"y\":351.8914098009847,\"color\":\"#0f172a\",\"width\":150,\"height\":60,\"kind\":\"node\"},{\"id\":\"node-mhbr01ax-02svd\",\"label\":\"TAGUM\",\"x\":-22.073925667033734,\"y\":476.3025249809715,\"color\":\"#0f172a\",\"width\":150,\"height\":60,\"kind\":\"node\"},{\"id\":\"label-mhio602o-j8j4t\",\"label\":\"CORE NEs\",\"x\":-748.633764169538,\"y\":448.61236051674234,\"color\":\"#1e293b\",\"width\":150,\"height\":60,\"kind\":\"label\"},{\"id\":\"label-mhio60jb-dj68f\",\"label\":\"IPCORE Network\",\"x\":-749.5410755873329,\"y\":309.69162111522144,\"color\":\"#1e293b\",\"width\":151,\"height\":60,\"kind\":\"label\"},{\"id\":\"node-mhip4czc-b4zky\",\"label\":\"QUEZON\",\"x\":-20.968458408343537,\"y\":40.242059645249526,\"color\":\"#0f172a\",\"width\":150,\"height\":60,\"kind\":\"node\"},{\"id\":\"node-mhip5amw-wq94b\",\"label\":\"BAGANI\",\"x\":-327.05633771092687,\"y\":43.44293191595284,\"color\":\"#0f172a\",\"width\":150,\"height\":60,\"kind\":\"node\"},{\"id\":\"label-mhiq0kdd-mzrok\",\"label\":\"The Rest of South Luzon, Visayas, and Mindanao Network\",\"x\":169.95297122636345,\"y\":249.7841500415762,\"color\":\"#1e293b\",\"width\":185,\"height\":60,\"kind\":\"label\"},{\"id\":\"node-mhsjz4om-mljge\",\"label\":\"MATINA\",\"x\":-271.57713516973826,\"y\":473.32589197099617,\"color\":\"#0f172a\",\"width\":142,\"height\":80,\"kind\":\"node\"}],\"edges\":[{\"id\":\"edge-mhio6kn2-ml693\",\"source\":\"label-mhio60jb-dj68f\",\"target\":\"DAVAO\",\"sourceHandle\":\"s-top-1\",\"targetHandle\":\"t-left-1\",\"label\":\"\",\"structural\":true,\"loads\":[],\"animated\":false,\"labelT\":0.5},{\"id\":\"edge-mhio6s51-w5cbq\",\"source\":\"label-mhio602o-j8j4t\",\"target\":\"label-mhio60jb-dj68f\",\"sourceHandle\":\"s-top-1\",\"targetHandle\":\"t-bottom-1\",\"label\":\"\",\"structural\":true,\"loads\":[],\"type\":\"straight\",\"animated\":false,\"labelT\":0.5},{\"id\":\"edge-mhip97un-mwlbb\",\"source\":\"DAVAO\",\"target\":\"node-mhip4czc-b4zky\",\"sourceHandle\":\"s-top-1\",\"targetHandle\":\"t-left-1\",\"label\":\"144FKC-GLOBE HYBRID\",\"structural\":false,\"loads\":[\"GALACTUS EP\"],\"type\":\"smoothstep\",\"animated\":true,\"labelT\":0.13},{\"id\":\"edge-mhip9j9a-ontz5\",\"source\":\"DAVAO\",\"target\":\"node-mhip4czc-b4zky\",\"sourceHandle\":\"s-right-1\",\"targetHandle\":\"t-left-1\",\"label\":\"144FKC-TELIC PHIL HYBRID\",\"structural\":false,\"loads\":[\"GALACTUS DP\",\"COHERENT\",\"DODRIO/Nokia\"],\"type\":\"smoothstep\",\"animated\":true,\"labelT\":0.4600000000000001},{\"id\":\"edge-mhipv0lv-48b2y\",\"source\":\"DAVAO\",\"target\":\"node-mhbqzvjk-wruc1\",\"sourceHandle\":\"s-right-1\",\"targetHandle\":\"t-top-1\",\"label\":\"144GLOBE FOC-DIGOS\",\"structural\":false,\"loads\":[\"GALACTUS EP\"],\"type\":\"bezier\",\"animated\":true,\"labelT\":0.65},{\"id\":\"edge-mhipvmq5-aw58y\",\"source\":\"DAVAO\",\"target\":\"node-mhbqzvjk-wruc1\",\"sourceHandle\":\"s-right-1\",\"targetHandle\":\"t-left-1\",\"label\":\"144FKC-DIGOS\",\"structural\":false,\"loads\":[\"DODRIO/Nokia\",\"COHERENT\"],\"type\":\"bezier\",\"animated\":true,\"labelT\":0.66},{\"id\":\"edge-mhipwzk0-tv7s6\",\"source\":\"DAVAO\",\"target\":\"node-mhbr01ax-02svd\",\"sourceHandle\":\"s-bottom-1\",\"targetHandle\":\"t-left-1\",\"label\":\"144FKC-GLOBE HYBRID\",\"structural\":false,\"loads\":[\"GALACTUS DP\",\"GALACTUS EP\",\"COHERENT\",\"DODRIO/Nokia\"],\"type\":\"smoothstep\",\"animated\":true,\"labelT\":0.47},{\"id\":\"edge-mhiq4mrq-fdcni\",\"source\":\"node-mhip4czc-b4zky\",\"target\":\"label-mhiq0kdd-mzrok\",\"sourceHandle\":\"s-right-1\",\"targetHandle\":\"t-top-1\",\"label\":\"\",\"structural\":true,\"loads\":[],\"animated\":false,\"labelT\":0.5},{\"id\":\"edge-mhiq4rre-ykvvq\",\"source\":\"node-mhbr01ax-02svd\",\"target\":\"label-mhiq0kdd-mzrok\",\"sourceHandle\":\"s-right-1\",\"targetHandle\":\"t-bottom-1\",\"label\":\"\",\"structural\":true,\"loads\":[],\"animated\":false,\"labelT\":0.5},{\"id\":\"edge-mhiq5nrp-sxd11\",\"source\":\"node-mhbqzvjk-wruc1\",\"target\":\"label-mhiq0kdd-mzrok\",\"sourceHandle\":\"s-right-1\",\"targetHandle\":\"t-left-1\",\"label\":\"\",\"structural\":true,\"loads\":[],\"type\":\"bezier\",\"animated\":false,\"labelT\":0.5}]}', '{\"code\":\"DAVAO\",\"name\":\"Davao\",\"updatedAt\":1762820911339}', 1, '2025-11-11 00:28:31', '2025-10-28 08:05:45'),
(2, '{\"nodes\":[{\"id\":\"ILIGAN\",\"label\":\"Iligan\",\"x\":-31.730251999265903,\"y\":8.725819299798133,\"color\":\"#1d4ed8\",\"width\":150,\"height\":60,\"kind\":\"core\"},{\"id\":\"node-mhbkkhtx-el24d\",\"label\":\"TUBOD\",\"x\":258.61752401934484,\"y\":-171.64347515297558,\"color\":\"#0f172a\",\"width\":150,\"height\":60,\"kind\":\"node\"},{\"id\":\"node-mhbkl7cv-yt8my\",\"label\":\"PAGADIAN\",\"x\":666.4100181069201,\"y\":-168.2100019258677,\"color\":\"#0f172a\",\"width\":150,\"height\":60,\"kind\":\"node\"},{\"id\":\"label-mhbkp2n6-v2uzs\",\"label\":\"IPCORE Network\",\"x\":-204.8114195811716,\"y\":82.7225013687912,\"color\":\"#1e293b\",\"width\":164,\"height\":60,\"kind\":\"label\"},{\"id\":\"label-mhbkpr1f-83ml8\",\"label\":\"CORE NEs\",\"x\":-197.71738095487183,\"y\":215.9650287895256,\"color\":\"#1e293b\",\"width\":150,\"height\":60,\"kind\":\"label\"},{\"id\":\"node-mhbkzwv8-icl5c\",\"label\":\"CDO\",\"x\":332.7395828006612,\"y\":10.389111527944351,\"color\":\"#0f172a\",\"width\":150,\"height\":60,\"kind\":\"node\"},{\"id\":\"node-mhbl00hs-1yrjs\",\"label\":\"DAUIN\",\"x\":258.7592657693965,\"y\":205.2347183867244,\"color\":\"#0f172a\",\"width\":150,\"height\":60,\"kind\":\"node\"},{\"id\":\"label-mhbl0yr5-yblk7\",\"label\":\"The Rest of South Luzon, Visayas, and Mindanao Network\",\"x\":767.3016686978974,\"y\":1.8187109007088225,\"color\":\"#1e293b\",\"width\":182,\"height\":91,\"kind\":\"label\"}],\"edges\":[{\"id\":\"edge-mhbklvj7-rvsmz\",\"source\":\"node-mhbkkhtx-el24d\",\"target\":\"node-mhbkl7cv-yt8my\",\"sourceHandle\":\"s-right-1\",\"targetHandle\":\"t-left-1\",\"label\":\"144C UG FOC\",\"structural\":false,\"loads\":[\"DWDM MAIN\",\"DODRIO/Nokia\",\"DWDM SPAN\"],\"type\":\"bezier\",\"animated\":true,\"labelT\":0.66},{\"id\":\"edge-mhbl3m5b-zacyi\",\"source\":\"ILIGAN\",\"target\":\"node-mhbkzwv8-icl5c\",\"sourceHandle\":\"s-right-1\",\"targetHandle\":\"t-left-1\",\"label\":\"144C UG FOC\",\"structural\":false,\"loads\":[\"DWDM LAYER 1 MAIN\",\"DWDM LAYER 2 MAIN\",\"GALACTUS EP\",\"DODRIO/Nokia\",\"CDO-TUBOG COHERENT (BYPASS)\",\"DWDM LAYER 1 SPAN\",\"DWDM LAYER 2 SPAN\"],\"type\":\"bezier\",\"animated\":true,\"labelT\":0.61},{\"id\":\"edge-mhbl3wih-ybnol\",\"source\":\"ILIGAN\",\"target\":\"node-mhbl00hs-1yrjs\",\"sourceHandle\":\"s-bottom-1\",\"targetHandle\":\"t-left-1\",\"label\":\"12C UG/SUBMARINE via Manticao\",\"structural\":false,\"loads\":[\"DWDM\",\"COHERENT\"],\"type\":\"smoothstep\",\"animated\":true,\"labelT\":0.29},{\"id\":\"edge-mhbl4dqe-9v2lh\",\"source\":\"label-mhbl0yr5-yblk7\",\"target\":\"node-mhbl00hs-1yrjs\",\"sourceHandle\":\"s-bottom-1\",\"targetHandle\":\"t-right-1\",\"label\":\"\",\"structural\":true,\"loads\":[],\"animated\":false,\"labelT\":0.5},{\"id\":\"edge-mhbl4l0e-h69ia\",\"source\":\"label-mhbl0yr5-yblk7\",\"target\":\"node-mhbkl7cv-yt8my\",\"sourceHandle\":\"s-top-1\",\"targetHandle\":\"t-right-1\",\"label\":\"\",\"structural\":true,\"loads\":[],\"animated\":false,\"labelT\":0.5},{\"id\":\"edge-mhbr3ph5-nuejq\",\"source\":\"label-mhbkp2n6-v2uzs\",\"target\":\"ILIGAN\",\"sourceHandle\":\"s-top-1\",\"targetHandle\":\"t-left-1\",\"label\":\"\",\"structural\":true,\"loads\":[],\"animated\":false,\"labelT\":0.5},{\"id\":\"edge-mhbr3ts7-5d932\",\"source\":\"label-mhbkpr1f-83ml8\",\"target\":\"label-mhbkp2n6-v2uzs\",\"sourceHandle\":\"s-top-1\",\"targetHandle\":\"t-bottom-1\",\"label\":\"\",\"structural\":true,\"loads\":[],\"animated\":false,\"labelT\":0.5},{\"id\":\"edge-mhbr4ezo-x79uu\",\"source\":\"ILIGAN\",\"target\":\"node-mhbkkhtx-el24d\",\"sourceHandle\":\"s-right-1\",\"targetHandle\":\"t-left-1\",\"label\":\"48C UG FOC\",\"structural\":false,\"loads\":[\"DWDM MAIN\",\"GALACTUS EP\",\"DODRIO/Nokia\",\"CDO-TUBOD COHERENT (BYPASS)\"],\"type\":\"bezier\",\"animated\":true,\"labelT\":0.5},{\"id\":\"edge-mhbr6uxu-ku91p\",\"source\":\"node-mhbkkhtx-el24d\",\"target\":\"label-mhbl0yr5-yblk7\",\"sourceHandle\":\"s-right-1\",\"targetHandle\":\"t-left-1\",\"label\":\"\",\"structural\":true,\"loads\":[],\"type\":\"bezier\",\"animated\":false,\"labelT\":0.5},{\"id\":\"edge-mhbr75iv-1unu4\",\"source\":\"node-mhbkzwv8-icl5c\",\"target\":\"label-mhbl0yr5-yblk7\",\"sourceHandle\":\"s-right-1\",\"targetHandle\":\"t-left-1\",\"label\":\"\",\"structural\":true,\"loads\":[],\"type\":\"bezier\",\"animated\":false,\"labelT\":0.5},{\"id\":\"edge-mhlodg80-2cmcg\",\"source\":\"ILIGAN\",\"target\":\"node-mhbkkhtx-el24d\",\"sourceHandle\":\"s-top-1\",\"targetHandle\":\"t-left-1\",\"label\":\"72C AERIAL FOC\",\"structural\":false,\"loads\":[\"DWDM\",\"DODRIO/Nokia\",\"DWDM SPAN\"],\"animated\":true,\"labelT\":0.28}]}', '{\"code\":\"ILIGAN\",\"name\":\"Iligan\",\"updatedAt\":1762396883622}', 1, '2025-11-06 02:41:23', '2025-10-29 06:03:34'),
(3, '{\"nodes\":[{\"id\":\"MARAMAG\",\"label\":\"MARAMAG\",\"x\":14.028367249036222,\"y\":0,\"color\":\"#1d4ed8\",\"width\":150,\"height\":60,\"kind\":\"core\"},{\"id\":\"label-mhlotj9q-iclyk\",\"label\":\"IPCORE Network\",\"x\":-124.5,\"y\":91.5,\"color\":\"#1e293b\",\"width\":154,\"height\":70,\"kind\":\"label\"},{\"id\":\"label-mhlotqvt-mar85\",\"label\":\"CORE NEs\",\"x\":-122.5833385006261,\"y\":193.91317478356217,\"color\":\"#1e293b\",\"width\":140,\"height\":60,\"kind\":\"label\"},{\"id\":\"node-mhlovxbg-7sjbf\",\"label\":\"MALAYBALAY\",\"x\":437.0575551936288,\"y\":-174.4668103609314,\"color\":\"#0f172a\",\"width\":190,\"height\":80,\"kind\":\"node\"},{\"id\":\"node-mhlow2la-2u42e\",\"label\":\"MLANG\",\"x\":435.8097421560557,\"y\":-0.028168122426620812,\"color\":\"#0f172a\",\"width\":190,\"height\":80,\"kind\":\"node\"},{\"id\":\"node-mhlow4oq-126ct\",\"label\":\"QUEZON\",\"x\":433.10585124115255,\"y\":200.49288974642195,\"color\":\"#0f172a\",\"width\":190,\"height\":80,\"kind\":\"node\"},{\"id\":\"label-mhlozpzc-x66ju\",\"label\":\"The Rest of South Luzon, Visayas, and Mindanao Network\",\"x\":793.3468404131199,\"y\":-10.362141909474246,\"color\":\"#1e293b\",\"width\":200,\"height\":70,\"kind\":\"label\"}],\"edges\":[{\"id\":\"edge-mhlou18y-gfcph\",\"source\":\"label-mhlotqvt-mar85\",\"target\":\"label-mhlotj9q-iclyk\",\"sourceHandle\":\"s-top-1\",\"targetHandle\":\"t-bottom-1\",\"label\":\"\",\"structural\":true,\"loads\":[],\"type\":\"straight\",\"animated\":false,\"labelT\":0.5},{\"id\":\"edge-mhlou7z3-ladrc\",\"source\":\"label-mhlotj9q-iclyk\",\"target\":\"MARAMAG\",\"sourceHandle\":\"s-top-1\",\"targetHandle\":\"t-left-1\",\"label\":\"\",\"structural\":true,\"loads\":[],\"animated\":false,\"labelT\":0.5},{\"id\":\"edge-mhlowqhf-tvadj\",\"source\":\"MARAMAG\",\"target\":\"node-mhlow2la-2u42e\",\"sourceHandle\":\"s-right-1\",\"targetHandle\":\"t-left-1\",\"label\":\"144C UG FOC\",\"structural\":false,\"loads\":[\"DODRIO/Nokia\",\"GALACTUS DP\",\"COHERENT\"],\"type\":\"bezier\",\"animated\":true,\"labelT\":0.57},{\"id\":\"edge-mhlox7y4-dewdk\",\"source\":\"MARAMAG\",\"target\":\"node-mhlovxbg-7sjbf\",\"sourceHandle\":\"s-right-1\",\"targetHandle\":\"t-left-1\",\"label\":\"144C UG FOC\",\"structural\":false,\"loads\":[\"DODRIO/Nokia\",\"DWDM MAIN\",\"COHERENT\",\"GALACTUS DP\",\"GALACTUS EP\"],\"type\":\"bezier\",\"animated\":true,\"labelT\":0.5},{\"id\":\"edge-mhloxht7-0u8ni\",\"source\":\"MARAMAG\",\"target\":\"node-mhlovxbg-7sjbf\",\"sourceHandle\":\"s-top-1\",\"targetHandle\":\"t-left-1\",\"label\":\"72C Aerial FOC\",\"structural\":false,\"loads\":[\"DWDM SPAN\"],\"type\":\"smoothstep\",\"animated\":true,\"labelT\":0.5},{\"id\":\"edge-mhloxovv-hxnn7\",\"source\":\"MARAMAG\",\"target\":\"node-mhlow4oq-126ct\",\"sourceHandle\":\"s-right-1\",\"targetHandle\":\"t-left-1\",\"label\":\"144C UG FOC\",\"structural\":false,\"loads\":[\"DODRIO/Nokia\",\"DWDM MAIN\",\"GALACTUS EP\"],\"type\":\"bezier\",\"animated\":true,\"labelT\":0.5},{\"id\":\"edge-mhloxtbk-wm6bn\",\"source\":\"MARAMAG\",\"target\":\"node-mhlow4oq-126ct\",\"sourceHandle\":\"s-bottom-1\",\"targetHandle\":\"t-left-1\",\"label\":\"24C Aerial FOC\",\"structural\":false,\"loads\":[\"COHERENT\",\"DWDM SPAN\",\"GALACTUS DP\"],\"animated\":true,\"labelT\":0.5},{\"id\":\"edge-mhlp05h8-xggld\",\"source\":\"node-mhlovxbg-7sjbf\",\"target\":\"label-mhlozpzc-x66ju\",\"sourceHandle\":\"s-right-1\",\"targetHandle\":\"t-top-1\",\"label\":\"\",\"structural\":true,\"loads\":[],\"animated\":false,\"labelT\":0.5},{\"id\":\"edge-mhlp099b-cuqq9\",\"source\":\"node-mhlow4oq-126ct\",\"target\":\"label-mhlozpzc-x66ju\",\"sourceHandle\":\"s-right-1\",\"targetHandle\":\"t-bottom-1\",\"label\":\"\",\"structural\":true,\"loads\":[],\"animated\":false,\"labelT\":0.5},{\"id\":\"edge-mhlp0beo-h6vpe\",\"source\":\"node-mhlow2la-2u42e\",\"target\":\"label-mhlozpzc-x66ju\",\"sourceHandle\":\"s-right-1\",\"targetHandle\":\"t-left-1\",\"label\":\"\",\"structural\":true,\"loads\":[],\"type\":\"bezier\",\"animated\":false,\"labelT\":0.5}]}', '{\"code\":\"MARAMAG\",\"name\":\"Maramag\",\"updatedAt\":1762829717544}', 1, '2025-11-11 02:55:17', '2025-11-04 15:22:24'),
(5, '{\"nodes\":[{\"id\":\"BUTUAN\",\"label\":\"BUTUAN\",\"x\":-0.5599741811458046,\"y\":1.0137932912471115,\"color\":\"#1d4ed8\",\"width\":150,\"height\":60,\"kind\":\"core\"},{\"id\":\"label-mhsk1nlf-ntsl0\",\"label\":\"IPCORE Network\",\"x\":-127.68847975534469,\"y\":102.09952636103634,\"color\":\"#1e293b\",\"width\":144,\"height\":70,\"kind\":\"label\"},{\"id\":\"label-mhsk1qpg-36nzb\",\"label\":\"CORE NEs\",\"x\":-127.6332169102696,\"y\":215.19584415913926,\"color\":\"#1e293b\",\"width\":140,\"height\":70,\"kind\":\"label\"},{\"id\":\"node-mhsoxbv2-bj56d\",\"label\":\"MAASIN\",\"x\":326.349439424957,\"y\":-148.06390058239143,\"color\":\"#0f172a\",\"width\":190,\"height\":80,\"kind\":\"node\"},{\"id\":\"node-mhsoxn0e-p3m1z\",\"label\":\"GINGOOG\",\"x\":330.0386410148033,\"y\":10.437746218274185,\"color\":\"#0f172a\",\"width\":190,\"height\":80,\"kind\":\"node\"},{\"id\":\"node-mhsoxp3v-wa0p5\",\"label\":\"New Node\",\"x\":323.45988159900264,\"y\":187.80518830802424,\"color\":\"#0f172a\",\"width\":190,\"height\":80,\"kind\":\"node\"}],\"edges\":[{\"id\":\"edge-mhsk36fy-yvrtu\",\"source\":\"label-mhsk1qpg-36nzb\",\"target\":\"label-mhsk1nlf-ntsl0\",\"sourceHandle\":\"s-top-1\",\"targetHandle\":\"t-bottom-1\",\"label\":\"\",\"structural\":true,\"loads\":[],\"type\":\"straight\",\"animated\":false,\"labelT\":0.5},{\"id\":\"edge-mhsk3g9g-xzxoo\",\"source\":\"label-mhsk1nlf-ntsl0\",\"target\":\"BUTUAN\",\"sourceHandle\":\"s-top-1\",\"targetHandle\":\"t-left-1\",\"label\":\"\",\"structural\":true,\"loads\":[],\"animated\":false,\"labelT\":0.5},{\"id\":\"edge-mhsrdq0e-yu3r2\",\"source\":\"BUTUAN\",\"target\":\"node-mhsoxbv2-bj56d\",\"sourceHandle\":\"s-top-1\",\"targetHandle\":\"t-left-1\",\"label\":\"\",\"structural\":false,\"loads\":[],\"animated\":false,\"labelT\":0.5},{\"id\":\"edge-mhsrdsd6-o5lxb\",\"source\":\"BUTUAN\",\"target\":\"node-mhsoxbv2-bj56d\",\"sourceHandle\":\"s-top-1\",\"targetHandle\":\"t-left-1\",\"label\":\"\",\"structural\":false,\"loads\":[],\"animated\":false,\"labelT\":0.5},{\"id\":\"edge-mhsrmywz-vr9ea\",\"source\":\"BUTUAN\",\"target\":\"node-mhsoxp3v-wa0p5\",\"sourceHandle\":\"s-bottom-1\",\"targetHandle\":\"t-left-1\",\"label\":\"\",\"structural\":false,\"loads\":[],\"animated\":false,\"labelT\":0.5}]}', '{\"code\":\"BUTUAN\",\"name\":\"Butuan\",\"updatedAt\":1762756384885}', 1, '2025-11-10 06:33:04', '2025-11-10 03:02:07'),
(6, '{\"nodes\":[{\"id\":\"BACOLOD\",\"label\":\"BACOLOD\",\"x\":0,\"y\":0,\"color\":\"#1d4ed8\",\"width\":150,\"height\":60,\"kind\":\"core\"},{\"id\":\"label-mhskh5ax-r3s1p\",\"label\":\"CORE NEs\",\"x\":-139.57464419621442,\"y\":205.7027176768663,\"color\":\"#1e293b\",\"width\":140,\"height\":67,\"kind\":\"label\"},{\"id\":\"label-mhskh5oc-hvexr\",\"label\":\"IPCODE Network\",\"x\":-139.8792962897133,\"y\":101.30564625307795,\"color\":\"#1e293b\",\"width\":140,\"height\":69,\"kind\":\"label\"},{\"id\":\"node-mhsklyq2-fia8q\",\"label\":\"JMBASA\",\"x\":479.23138851997174,\"y\":-177.76984505572872,\"color\":\"#0f172a\",\"width\":190,\"height\":80,\"kind\":\"node\"},{\"id\":\"node-mhskm39h-e5fjt\",\"label\":\"KABANLAKAN\",\"x\":482.3105110347516,\"y\":1.2323148146681433,\"color\":\"#0f172a\",\"width\":190,\"height\":80,\"kind\":\"node\"},{\"id\":\"node-mhskm5h4-18vve\",\"label\":\"CADIZ\",\"x\":482.23019610506486,\"y\":203.99450997718498,\"color\":\"#0f172a\",\"width\":190,\"height\":80,\"kind\":\"node\"},{\"id\":\"label-mhskqo2h-csrod\",\"label\":\"The Rest of South Luzon, Visayas, and Mindanao Network\",\"x\":896.9550853331215,\"y\":-12.479454689078807,\"color\":\"#1e293b\",\"width\":200,\"height\":70,\"kind\":\"label\"}],\"edges\":[{\"id\":\"edge-mhskhcqk-wsmvm\",\"source\":\"label-mhskh5oc-hvexr\",\"target\":\"BACOLOD\",\"sourceHandle\":\"s-top-1\",\"targetHandle\":\"t-left-1\",\"label\":\"\",\"structural\":true,\"loads\":[],\"animated\":false,\"labelT\":0.5},{\"id\":\"edge-mhskhe0t-x9thz\",\"source\":\"label-mhskh5ax-r3s1p\",\"target\":\"label-mhskh5oc-hvexr\",\"sourceHandle\":\"s-top-1\",\"targetHandle\":\"t-bottom-1\",\"label\":\"\",\"structural\":true,\"loads\":[],\"type\":\"straight\",\"animated\":false,\"labelT\":0.5},{\"id\":\"edge-mhskpb3i-a1hw8\",\"source\":\"BACOLOD\",\"target\":\"node-mhsklyq2-fia8q\",\"sourceHandle\":\"s-top-1\",\"targetHandle\":\"t-left-1\",\"label\":\"144C UG/ SUBMARINE via FOBN2\",\"structural\":false,\"loads\":[\"DWDM LAYER 1\",\"DWDM LAYER 2\",\"COHERENT\",\"GALACTUS DP\",\"GALACTUS EP\",\"DODRIO/Nokia\"],\"animated\":true,\"labelT\":0.59},{\"id\":\"edge-mhskpd8c-4nh5w\",\"source\":\"BACOLOD\",\"target\":\"node-mhskm5h4-18vve\",\"sourceHandle\":\"s-bottom-1\",\"targetHandle\":\"t-left-1\",\"label\":\"144C UG & 72C Aerial FOC\",\"structural\":false,\"loads\":[\"DWDM LAYER 1\",\"DWDM LAYER 2\",\"COHERENT\",\"GALACTUS DP\"],\"animated\":true,\"labelT\":0.62},{\"id\":\"edge-mhskpeyd-axpwj\",\"source\":\"BACOLOD\",\"target\":\"node-mhskm39h-e5fjt\",\"sourceHandle\":\"s-right-1\",\"targetHandle\":\"t-left-1\",\"label\":\"72C Aerial & 144C UG via BSC\",\"structural\":false,\"loads\":[\"GALACTUS DP\"],\"type\":\"bezier\",\"animated\":true,\"labelT\":0.54},{\"id\":\"edge-mhskr8j1-33wu6\",\"source\":\"node-mhsklyq2-fia8q\",\"target\":\"label-mhskqo2h-csrod\",\"sourceHandle\":\"s-right-1\",\"targetHandle\":\"t-top-1\",\"label\":\"\",\"structural\":true,\"loads\":[],\"animated\":false,\"labelT\":0.5},{\"id\":\"edge-mhskrbln-yjwr7\",\"source\":\"node-mhskm5h4-18vve\",\"target\":\"label-mhskqo2h-csrod\",\"sourceHandle\":\"s-right-1\",\"targetHandle\":\"t-bottom-1\",\"label\":\"\",\"structural\":true,\"loads\":[],\"animated\":false,\"labelT\":0.5},{\"id\":\"edge-mhsksj5a-oxloj\",\"source\":\"node-mhskm39h-e5fjt\",\"target\":\"label-mhskqo2h-csrod\",\"sourceHandle\":\"s-right-1\",\"targetHandle\":\"t-left-1\",\"label\":\"\",\"structural\":true,\"loads\":[],\"type\":\"bezier\",\"animated\":false,\"labelT\":0.5}]}', '{\"code\":\"BACOLOD\",\"name\":\"Bacolod\",\"updatedAt\":1762820848456}', 1, '2025-11-11 00:27:28', '2025-11-10 03:16:13'),
(7, '{\"nodes\":[{\"id\":\"ORMOR\",\"label\":\"ORMOC\",\"x\":-1.3663427418590004,\"y\":-1.3663427418589436,\"color\":\"#1d4ed8\",\"width\":150,\"height\":60,\"kind\":\"core\"},{\"id\":\"label-mhsrqtr5-fa2lt\",\"label\":\"IPCORE NETWORK\",\"x\":-181.99938025984522,\"y\":102.2668885218913,\"color\":\"#1e293b\",\"width\":200,\"height\":70,\"kind\":\"label\"},{\"id\":\"label-mhsrqyof-tke7y\",\"label\":\"CORE NEs\",\"x\":-182.3326927267804,\"y\":225.26879890989346,\"color\":\"#1e293b\",\"width\":200,\"height\":70,\"kind\":\"label\"},{\"id\":\"node-mhsrrdc6-b6twf\",\"label\":\"TACLOBAN\",\"x\":339.96797189231035,\"y\":-156.16099842460443,\"color\":\"#0f172a\",\"width\":190,\"height\":80,\"kind\":\"node\"},{\"id\":\"node-mhsrrhhq-liye6\",\"label\":\"MAASIN\",\"x\":337.12253700099245,\"y\":191.73792207122148,\"color\":\"#0f172a\",\"width\":190,\"height\":80,\"kind\":\"node\"},{\"id\":\"node-mhsrzm7i-xl6dh\",\"label\":\"CALBAYOG\",\"x\":651.319290481289,\"y\":-155.51529903196865,\"color\":\"#0f172a\",\"width\":190,\"height\":80,\"kind\":\"node\"},{\"id\":\"node-mhsrzq4p-nmw6q\",\"label\":\"TABILARAN\",\"x\":656.3097769762119,\"y\":191.05126350639705,\"color\":\"#0f172a\",\"width\":190,\"height\":80,\"kind\":\"node\"},{\"id\":\"label-mhss0hnw-mam4e\",\"label\":\"FOBN1 NETWORK, (Eastern Visayas, South Luzon & Mindanao Network)\",\"x\":972.3125751298901,\"y\":-193.3566073715449,\"color\":\"#1e293b\",\"width\":160,\"height\":64,\"kind\":\"label\"},{\"id\":\"label-mhss0owj-4oc92\",\"label\":\"FOBN2 NETWORK, (Western Visayas, South Luzon & Mindanao Network)\",\"x\":969.3775108626239,\"y\":161.69241846020498,\"color\":\"#1e293b\",\"width\":166,\"height\":60,\"kind\":\"label\"}],\"edges\":[{\"id\":\"edge-mhsrs3tf-tqeru\",\"source\":\"ORMOR\",\"target\":\"node-mhsrrdc6-b6twf\",\"sourceHandle\":\"s-top-1\",\"targetHandle\":\"t-left-1\",\"label\":\"48C AERIAL\",\"structural\":false,\"loads\":[\"DODRIO/Nokia\"],\"type\":\"smoothstep\",\"animated\":true,\"labelT\":0.57},{\"id\":\"edge-mhsrsz9r-zqrh8\",\"source\":\"ORMOR\",\"target\":\"node-mhsrrdc6-b6twf\",\"sourceHandle\":\"s-right-1\",\"targetHandle\":\"t-bottom-1\",\"label\":\"48C UG\",\"structural\":false,\"loads\":[\"DWDM LAYER 1\",\"DWDM LAYER 2\",\"COHERENT\",\"GALACTUS DP\"],\"type\":\"bezier\",\"animated\":true,\"labelT\":0.67},{\"id\":\"edge-mhsrvgxy-vvn4v\",\"source\":\"ORMOR\",\"target\":\"node-mhsrrhhq-liye6\",\"sourceHandle\":\"s-bottom-1\",\"targetHandle\":\"t-left-1\",\"label\":\"144C UG\",\"structural\":false,\"loads\":[\"DWDM LAYER 1\",\"DWDM LAYER 2\",\"DODRIO/Nokia\"],\"animated\":true,\"labelT\":0.6199999999999999},{\"id\":\"edge-mhsrx8f4-kx10l\",\"source\":\"ORMOR\",\"target\":\"node-mhsrrhhq-liye6\",\"sourceHandle\":\"s-right-1\",\"targetHandle\":\"t-top-1\",\"label\":\"48C AERIAL\",\"structural\":false,\"loads\":[\"COHERENT\",\"GALACTUS EP\"],\"type\":\"bezier\",\"animated\":true,\"labelT\":0.65},{\"id\":\"edge-mhsrzwnf-vbjk2\",\"source\":\"node-mhsrrdc6-b6twf\",\"target\":\"node-mhsrzm7i-xl6dh\",\"sourceHandle\":\"s-right-1\",\"targetHandle\":\"t-left-1\",\"label\":\"\",\"structural\":true,\"loads\":[],\"type\":\"straight\",\"animated\":false,\"labelT\":0.5},{\"id\":\"edge-mhsrzyrc-avy6y\",\"source\":\"node-mhsrrhhq-liye6\",\"target\":\"node-mhsrzq4p-nmw6q\",\"sourceHandle\":\"s-right-1\",\"targetHandle\":\"t-left-1\",\"label\":\"\",\"structural\":true,\"loads\":[],\"type\":\"straight\",\"animated\":false,\"labelT\":0.5},{\"id\":\"edge-mhss10n8-9lxf8\",\"source\":\"node-mhsrzm7i-xl6dh\",\"target\":\"label-mhss0hnw-mam4e\",\"sourceHandle\":\"s-right-1\",\"targetHandle\":\"t-left-1\",\"label\":\"\",\"structural\":true,\"loads\":[],\"type\":\"straight\",\"animated\":false,\"labelT\":0.5},{\"id\":\"edge-mhss13cw-5vsx9\",\"source\":\"node-mhsrzq4p-nmw6q\",\"target\":\"label-mhss0owj-4oc92\",\"sourceHandle\":\"s-right-1\",\"targetHandle\":\"t-left-1\",\"label\":\"\",\"structural\":true,\"loads\":[],\"type\":\"straight\",\"animated\":false,\"labelT\":0.5},{\"id\":\"edge-mhss1gm9-qgjf4\",\"source\":\"label-mhss0hnw-mam4e\",\"target\":\"label-mhss0owj-4oc92\",\"sourceHandle\":\"s-bottom-1\",\"targetHandle\":\"t-top-1\",\"label\":\"\",\"structural\":true,\"loads\":[],\"type\":\"straight\",\"animated\":false,\"labelT\":0.5},{\"id\":\"edge-mhss28sj-guzxu\",\"source\":\"label-mhsrqtr5-fa2lt\",\"target\":\"ORMOR\",\"sourceHandle\":\"s-top-1\",\"targetHandle\":\"t-left-1\",\"label\":\"\",\"structural\":true,\"loads\":[],\"animated\":false,\"labelT\":0.5},{\"id\":\"edge-mhss2b7k-apojo\",\"source\":\"label-mhsrqyof-tke7y\",\"target\":\"label-mhsrqtr5-fa2lt\",\"sourceHandle\":\"s-top-1\",\"targetHandle\":\"t-bottom-1\",\"label\":\"\",\"structural\":true,\"loads\":[],\"type\":\"straight\",\"animated\":false,\"labelT\":0.5}]}', '{\"code\":\"ORMOC\",\"name\":\"Ormoc\",\"updatedAt\":1762835864181}', 1, '2025-11-11 04:37:44', '2025-11-10 06:39:16');

-- --------------------------------------------------------

--
-- Table structure for table `topologypublished`
--

CREATE TABLE `topologypublished` (
  `site_id` int(11) NOT NULL,
  `payload` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`payload`)),
  `meta` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`meta`)),
  `updated_by` int(11) DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `topologypublished`
--

INSERT INTO `topologypublished` (`site_id`, `payload`, `meta`, `updated_by`, `updated_at`, `created_at`) VALUES
(1, '{\"nodes\":[{\"id\":\"DAVAO\",\"label\":\"DAVAO\",\"x\":-627.5560872203057,\"y\":210.24819698372534,\"color\":\"#1d4ed8\",\"width\":150,\"height\":60,\"kind\":\"core\"},{\"id\":\"node-mhbqzvjk-wruc1\",\"label\":\"DIGOS\",\"x\":-303.1171630755433,\"y\":351.8914098009847,\"color\":\"#0f172a\",\"width\":150,\"height\":60,\"kind\":\"node\"},{\"id\":\"node-mhbr01ax-02svd\",\"label\":\"TAGUM\",\"x\":-22.073925667033734,\"y\":476.3025249809715,\"color\":\"#0f172a\",\"width\":150,\"height\":60,\"kind\":\"node\"},{\"id\":\"label-mhio602o-j8j4t\",\"label\":\"CORE NEs\",\"x\":-748.633764169538,\"y\":448.61236051674234,\"color\":\"#1e293b\",\"width\":150,\"height\":60,\"kind\":\"label\"},{\"id\":\"label-mhio60jb-dj68f\",\"label\":\"IPCORE Network\",\"x\":-749.5410755873329,\"y\":309.69162111522144,\"color\":\"#1e293b\",\"width\":151,\"height\":60,\"kind\":\"label\"},{\"id\":\"node-mhip4czc-b4zky\",\"label\":\"QUEZON\",\"x\":-20.968458408343537,\"y\":40.242059645249526,\"color\":\"#0f172a\",\"width\":150,\"height\":60,\"kind\":\"node\"},{\"id\":\"node-mhip5amw-wq94b\",\"label\":\"BAGANI\",\"x\":-327.05633771092687,\"y\":43.44293191595284,\"color\":\"#0f172a\",\"width\":150,\"height\":60,\"kind\":\"node\"},{\"id\":\"label-mhiq0kdd-mzrok\",\"label\":\"The Rest of South Luzon, Visayas, and Mindanao Network\",\"x\":169.95297122636345,\"y\":249.7841500415762,\"color\":\"#1e293b\",\"width\":185,\"height\":60,\"kind\":\"label\"},{\"id\":\"node-mhsjz4om-mljge\",\"label\":\"MATINA\",\"x\":-271.57713516973826,\"y\":473.32589197099617,\"color\":\"#0f172a\",\"width\":142,\"height\":80,\"kind\":\"node\"}],\"edges\":[{\"id\":\"edge-mhio6kn2-ml693\",\"source\":\"label-mhio60jb-dj68f\",\"target\":\"DAVAO\",\"sourceHandle\":\"s-top-1\",\"targetHandle\":\"t-left-1\",\"label\":\"\",\"structural\":true,\"loads\":[],\"animated\":false,\"labelT\":0.5},{\"id\":\"edge-mhio6s51-w5cbq\",\"source\":\"label-mhio602o-j8j4t\",\"target\":\"label-mhio60jb-dj68f\",\"sourceHandle\":\"s-top-1\",\"targetHandle\":\"t-bottom-1\",\"label\":\"\",\"structural\":true,\"loads\":[],\"type\":\"straight\",\"animated\":false,\"labelT\":0.5},{\"id\":\"edge-mhip97un-mwlbb\",\"source\":\"DAVAO\",\"target\":\"node-mhip4czc-b4zky\",\"sourceHandle\":\"s-top-1\",\"targetHandle\":\"t-left-1\",\"label\":\"144FKC-GLOBE HYBRID\",\"structural\":false,\"loads\":[\"GALACTUS EP\"],\"type\":\"smoothstep\",\"animated\":true,\"labelT\":0.13},{\"id\":\"edge-mhip9j9a-ontz5\",\"source\":\"DAVAO\",\"target\":\"node-mhip4czc-b4zky\",\"sourceHandle\":\"s-right-1\",\"targetHandle\":\"t-left-1\",\"label\":\"144FKC-TELIC PHIL HYBRID\",\"structural\":false,\"loads\":[\"GALACTUS DP\",\"COHERENT\",\"DODRIO/Nokia\"],\"type\":\"smoothstep\",\"animated\":true,\"labelT\":0.4600000000000001},{\"id\":\"edge-mhipv0lv-48b2y\",\"source\":\"DAVAO\",\"target\":\"node-mhbqzvjk-wruc1\",\"sourceHandle\":\"s-right-1\",\"targetHandle\":\"t-top-1\",\"label\":\"144GLOBE FOC-DIGOS\",\"structural\":false,\"loads\":[\"GALACTUS EP\"],\"type\":\"bezier\",\"animated\":true,\"labelT\":0.65},{\"id\":\"edge-mhipvmq5-aw58y\",\"source\":\"DAVAO\",\"target\":\"node-mhbqzvjk-wruc1\",\"sourceHandle\":\"s-right-1\",\"targetHandle\":\"t-left-1\",\"label\":\"144FKC-DIGOS\",\"structural\":false,\"loads\":[\"DODRIO/Nokia\",\"COHERENT\"],\"type\":\"bezier\",\"animated\":true,\"labelT\":0.66},{\"id\":\"edge-mhipwzk0-tv7s6\",\"source\":\"DAVAO\",\"target\":\"node-mhbr01ax-02svd\",\"sourceHandle\":\"s-bottom-1\",\"targetHandle\":\"t-left-1\",\"label\":\"144FKC-GLOBE HYBRID\",\"structural\":false,\"loads\":[\"GALACTUS DP\",\"GALACTUS EP\",\"COHERENT\",\"DODRIO/Nokia\"],\"type\":\"smoothstep\",\"animated\":true,\"labelT\":0.47},{\"id\":\"edge-mhiq4mrq-fdcni\",\"source\":\"node-mhip4czc-b4zky\",\"target\":\"label-mhiq0kdd-mzrok\",\"sourceHandle\":\"s-right-1\",\"targetHandle\":\"t-top-1\",\"label\":\"\",\"structural\":true,\"loads\":[],\"animated\":false,\"labelT\":0.5},{\"id\":\"edge-mhiq4rre-ykvvq\",\"source\":\"node-mhbr01ax-02svd\",\"target\":\"label-mhiq0kdd-mzrok\",\"sourceHandle\":\"s-right-1\",\"targetHandle\":\"t-bottom-1\",\"label\":\"\",\"structural\":true,\"loads\":[],\"animated\":false,\"labelT\":0.5},{\"id\":\"edge-mhiq5nrp-sxd11\",\"source\":\"node-mhbqzvjk-wruc1\",\"target\":\"label-mhiq0kdd-mzrok\",\"sourceHandle\":\"s-right-1\",\"targetHandle\":\"t-left-1\",\"label\":\"\",\"structural\":true,\"loads\":[],\"type\":\"bezier\",\"animated\":false,\"labelT\":0.5}]}', '{\"code\":\"DAVAO\",\"name\":\"Davao\",\"updatedAt\":1762820911339}', 1, '2025-11-11 00:28:31', '2025-10-28 08:05:45'),
(2, '{\"nodes\":[{\"id\":\"ILIGAN\",\"label\":\"Iligan\",\"x\":-31.730251999265903,\"y\":8.725819299798133,\"color\":\"#1d4ed8\",\"width\":150,\"height\":60,\"kind\":\"core\"},{\"id\":\"node-mhbkkhtx-el24d\",\"label\":\"TUBOD\",\"x\":258.61752401934484,\"y\":-171.64347515297558,\"color\":\"#0f172a\",\"width\":150,\"height\":60,\"kind\":\"node\"},{\"id\":\"node-mhbkl7cv-yt8my\",\"label\":\"PAGADIAN\",\"x\":666.4100181069201,\"y\":-168.2100019258677,\"color\":\"#0f172a\",\"width\":150,\"height\":60,\"kind\":\"node\"},{\"id\":\"label-mhbkp2n6-v2uzs\",\"label\":\"IPCORE Network\",\"x\":-204.8114195811716,\"y\":82.7225013687912,\"color\":\"#1e293b\",\"width\":164,\"height\":60,\"kind\":\"label\"},{\"id\":\"label-mhbkpr1f-83ml8\",\"label\":\"CORE NEs\",\"x\":-197.71738095487183,\"y\":215.9650287895256,\"color\":\"#1e293b\",\"width\":150,\"height\":60,\"kind\":\"label\"},{\"id\":\"node-mhbkzwv8-icl5c\",\"label\":\"CDO\",\"x\":332.7395828006612,\"y\":10.389111527944351,\"color\":\"#0f172a\",\"width\":150,\"height\":60,\"kind\":\"node\"},{\"id\":\"node-mhbl00hs-1yrjs\",\"label\":\"DAUIN\",\"x\":258.7592657693965,\"y\":205.2347183867244,\"color\":\"#0f172a\",\"width\":150,\"height\":60,\"kind\":\"node\"},{\"id\":\"label-mhbl0yr5-yblk7\",\"label\":\"The Rest of South Luzon, Visayas, and Mindanao Network\",\"x\":767.3016686978974,\"y\":1.8187109007088225,\"color\":\"#1e293b\",\"width\":182,\"height\":91,\"kind\":\"label\"}],\"edges\":[{\"id\":\"edge-mhbklvj7-rvsmz\",\"source\":\"node-mhbkkhtx-el24d\",\"target\":\"node-mhbkl7cv-yt8my\",\"sourceHandle\":\"s-right-1\",\"targetHandle\":\"t-left-1\",\"label\":\"144C UG FOC\",\"structural\":false,\"loads\":[\"DWDM MAIN\",\"DODRIO/Nokia\",\"DWDM SPAN\"],\"type\":\"bezier\",\"animated\":true,\"labelT\":0.66},{\"id\":\"edge-mhbl3m5b-zacyi\",\"source\":\"ILIGAN\",\"target\":\"node-mhbkzwv8-icl5c\",\"sourceHandle\":\"s-right-1\",\"targetHandle\":\"t-left-1\",\"label\":\"144C UG FOC\",\"structural\":false,\"loads\":[\"DWDM LAYER 1 MAIN\",\"DWDM LAYER 2 MAIN\",\"GALACTUS EP\",\"DODRIO/Nokia\",\"CDO-TUBOG COHERENT (BYPASS)\",\"DWDM LAYER 1 SPAN\",\"DWDM LAYER 2 SPAN\"],\"type\":\"bezier\",\"animated\":true,\"labelT\":0.61},{\"id\":\"edge-mhbl3wih-ybnol\",\"source\":\"ILIGAN\",\"target\":\"node-mhbl00hs-1yrjs\",\"sourceHandle\":\"s-bottom-1\",\"targetHandle\":\"t-left-1\",\"label\":\"12C UG/SUBMARINE via Manticao\",\"structural\":false,\"loads\":[\"DWDM\",\"COHERENT\"],\"type\":\"smoothstep\",\"animated\":true,\"labelT\":0.29},{\"id\":\"edge-mhbl4dqe-9v2lh\",\"source\":\"label-mhbl0yr5-yblk7\",\"target\":\"node-mhbl00hs-1yrjs\",\"sourceHandle\":\"s-bottom-1\",\"targetHandle\":\"t-right-1\",\"label\":\"\",\"structural\":true,\"loads\":[],\"animated\":false,\"labelT\":0.5},{\"id\":\"edge-mhbl4l0e-h69ia\",\"source\":\"label-mhbl0yr5-yblk7\",\"target\":\"node-mhbkl7cv-yt8my\",\"sourceHandle\":\"s-top-1\",\"targetHandle\":\"t-right-1\",\"label\":\"\",\"structural\":true,\"loads\":[],\"animated\":false,\"labelT\":0.5},{\"id\":\"edge-mhbr3ph5-nuejq\",\"source\":\"label-mhbkp2n6-v2uzs\",\"target\":\"ILIGAN\",\"sourceHandle\":\"s-top-1\",\"targetHandle\":\"t-left-1\",\"label\":\"\",\"structural\":true,\"loads\":[],\"animated\":false,\"labelT\":0.5},{\"id\":\"edge-mhbr3ts7-5d932\",\"source\":\"label-mhbkpr1f-83ml8\",\"target\":\"label-mhbkp2n6-v2uzs\",\"sourceHandle\":\"s-top-1\",\"targetHandle\":\"t-bottom-1\",\"label\":\"\",\"structural\":true,\"loads\":[],\"animated\":false,\"labelT\":0.5},{\"id\":\"edge-mhbr4ezo-x79uu\",\"source\":\"ILIGAN\",\"target\":\"node-mhbkkhtx-el24d\",\"sourceHandle\":\"s-right-1\",\"targetHandle\":\"t-left-1\",\"label\":\"48C UG FOC\",\"structural\":false,\"loads\":[\"DWDM MAIN\",\"GALACTUS EP\",\"DODRIO/Nokia\",\"CDO-TUBOD COHERENT (BYPASS)\"],\"type\":\"bezier\",\"animated\":true,\"labelT\":0.5},{\"id\":\"edge-mhbr6uxu-ku91p\",\"source\":\"node-mhbkkhtx-el24d\",\"target\":\"label-mhbl0yr5-yblk7\",\"sourceHandle\":\"s-right-1\",\"targetHandle\":\"t-left-1\",\"label\":\"\",\"structural\":true,\"loads\":[],\"type\":\"bezier\",\"animated\":false,\"labelT\":0.5},{\"id\":\"edge-mhbr75iv-1unu4\",\"source\":\"node-mhbkzwv8-icl5c\",\"target\":\"label-mhbl0yr5-yblk7\",\"sourceHandle\":\"s-right-1\",\"targetHandle\":\"t-left-1\",\"label\":\"\",\"structural\":true,\"loads\":[],\"type\":\"bezier\",\"animated\":false,\"labelT\":0.5},{\"id\":\"edge-mhlodg80-2cmcg\",\"source\":\"ILIGAN\",\"target\":\"node-mhbkkhtx-el24d\",\"sourceHandle\":\"s-top-1\",\"targetHandle\":\"t-left-1\",\"label\":\"72C AERIAL FOC\",\"structural\":false,\"loads\":[\"DWDM\",\"DODRIO/Nokia\",\"DWDM SPAN\"],\"animated\":true,\"labelT\":0.28}]}', '{\"code\":\"ILIGAN\",\"name\":\"Iligan\",\"updatedAt\":1762396883622}', 1, '2025-11-06 02:41:23', '2025-10-29 06:03:34'),
(3, '{\"nodes\":[{\"id\":\"MARAMAG\",\"label\":\"MARAMAG\",\"x\":14.028367249036222,\"y\":0,\"color\":\"#1d4ed8\",\"width\":150,\"height\":60,\"kind\":\"core\"},{\"id\":\"label-mhlotj9q-iclyk\",\"label\":\"IPCORE Network\",\"x\":-124.5,\"y\":91.5,\"color\":\"#1e293b\",\"width\":154,\"height\":70,\"kind\":\"label\"},{\"id\":\"label-mhlotqvt-mar85\",\"label\":\"CORE NEs\",\"x\":-122.5833385006261,\"y\":193.91317478356217,\"color\":\"#1e293b\",\"width\":140,\"height\":60,\"kind\":\"label\"},{\"id\":\"node-mhlovxbg-7sjbf\",\"label\":\"MALAYBALAY\",\"x\":437.0575551936288,\"y\":-174.4668103609314,\"color\":\"#0f172a\",\"width\":190,\"height\":80,\"kind\":\"node\"},{\"id\":\"node-mhlow2la-2u42e\",\"label\":\"MLANG\",\"x\":435.8097421560557,\"y\":-0.028168122426620812,\"color\":\"#0f172a\",\"width\":190,\"height\":80,\"kind\":\"node\"},{\"id\":\"node-mhlow4oq-126ct\",\"label\":\"QUEZON\",\"x\":433.10585124115255,\"y\":200.49288974642195,\"color\":\"#0f172a\",\"width\":190,\"height\":80,\"kind\":\"node\"},{\"id\":\"label-mhlozpzc-x66ju\",\"label\":\"The Rest of South Luzon, Visayas, and Mindanao Network\",\"x\":793.3468404131199,\"y\":-10.362141909474246,\"color\":\"#1e293b\",\"width\":200,\"height\":70,\"kind\":\"label\"}],\"edges\":[{\"id\":\"edge-mhlou18y-gfcph\",\"source\":\"label-mhlotqvt-mar85\",\"target\":\"label-mhlotj9q-iclyk\",\"sourceHandle\":\"s-top-1\",\"targetHandle\":\"t-bottom-1\",\"label\":\"\",\"structural\":true,\"loads\":[],\"type\":\"straight\",\"animated\":false,\"labelT\":0.5},{\"id\":\"edge-mhlou7z3-ladrc\",\"source\":\"label-mhlotj9q-iclyk\",\"target\":\"MARAMAG\",\"sourceHandle\":\"s-top-1\",\"targetHandle\":\"t-left-1\",\"label\":\"\",\"structural\":true,\"loads\":[],\"animated\":false,\"labelT\":0.5},{\"id\":\"edge-mhlowqhf-tvadj\",\"source\":\"MARAMAG\",\"target\":\"node-mhlow2la-2u42e\",\"sourceHandle\":\"s-right-1\",\"targetHandle\":\"t-left-1\",\"label\":\"144C UG FOC\",\"structural\":false,\"loads\":[\"DODRIO/Nokia\",\"GALACTUS DP\",\"COHERENT\"],\"type\":\"bezier\",\"animated\":true,\"labelT\":0.57},{\"id\":\"edge-mhlox7y4-dewdk\",\"source\":\"MARAMAG\",\"target\":\"node-mhlovxbg-7sjbf\",\"sourceHandle\":\"s-right-1\",\"targetHandle\":\"t-left-1\",\"label\":\"144C UG FOC\",\"structural\":false,\"loads\":[\"DODRIO/Nokia\",\"DWDM MAIN\",\"COHERENT\",\"GALACTUS DP\",\"GALACTUS EP\"],\"type\":\"bezier\",\"animated\":true,\"labelT\":0.5},{\"id\":\"edge-mhloxht7-0u8ni\",\"source\":\"MARAMAG\",\"target\":\"node-mhlovxbg-7sjbf\",\"sourceHandle\":\"s-top-1\",\"targetHandle\":\"t-left-1\",\"label\":\"72C Aerial FOC\",\"structural\":false,\"loads\":[\"DWDM SPAN\"],\"type\":\"smoothstep\",\"animated\":true,\"labelT\":0.5},{\"id\":\"edge-mhloxovv-hxnn7\",\"source\":\"MARAMAG\",\"target\":\"node-mhlow4oq-126ct\",\"sourceHandle\":\"s-right-1\",\"targetHandle\":\"t-left-1\",\"label\":\"144C UG FOC\",\"structural\":false,\"loads\":[\"DODRIO/Nokia\",\"DWDM MAIN\",\"GALACTUS EP\"],\"type\":\"bezier\",\"animated\":true,\"labelT\":0.5},{\"id\":\"edge-mhloxtbk-wm6bn\",\"source\":\"MARAMAG\",\"target\":\"node-mhlow4oq-126ct\",\"sourceHandle\":\"s-bottom-1\",\"targetHandle\":\"t-left-1\",\"label\":\"24C Aerial FOC\",\"structural\":false,\"loads\":[\"COHERENT\",\"DWDM SPAN\",\"GALACTUS DP\"],\"animated\":true,\"labelT\":0.5},{\"id\":\"edge-mhlp05h8-xggld\",\"source\":\"node-mhlovxbg-7sjbf\",\"target\":\"label-mhlozpzc-x66ju\",\"sourceHandle\":\"s-right-1\",\"targetHandle\":\"t-top-1\",\"label\":\"\",\"structural\":true,\"loads\":[],\"animated\":false,\"labelT\":0.5},{\"id\":\"edge-mhlp099b-cuqq9\",\"source\":\"node-mhlow4oq-126ct\",\"target\":\"label-mhlozpzc-x66ju\",\"sourceHandle\":\"s-right-1\",\"targetHandle\":\"t-bottom-1\",\"label\":\"\",\"structural\":true,\"loads\":[],\"animated\":false,\"labelT\":0.5},{\"id\":\"edge-mhlp0beo-h6vpe\",\"source\":\"node-mhlow2la-2u42e\",\"target\":\"label-mhlozpzc-x66ju\",\"sourceHandle\":\"s-right-1\",\"targetHandle\":\"t-left-1\",\"label\":\"\",\"structural\":true,\"loads\":[],\"type\":\"bezier\",\"animated\":false,\"labelT\":0.5}]}', '{\"code\":\"MARAMAG\",\"name\":\"Maramag\",\"updatedAt\":1762829717544}', 1, '2025-11-11 02:55:17', '2025-11-04 15:22:24'),
(6, '{\"nodes\":[{\"id\":\"BACOLOD\",\"label\":\"BACOLOD\",\"x\":0,\"y\":0,\"color\":\"#1d4ed8\",\"width\":150,\"height\":60,\"kind\":\"core\"},{\"id\":\"label-mhskh5ax-r3s1p\",\"label\":\"CORE NEs\",\"x\":-139.57464419621442,\"y\":205.7027176768663,\"color\":\"#1e293b\",\"width\":140,\"height\":67,\"kind\":\"label\"},{\"id\":\"label-mhskh5oc-hvexr\",\"label\":\"IPCODE Network\",\"x\":-139.8792962897133,\"y\":101.30564625307795,\"color\":\"#1e293b\",\"width\":140,\"height\":69,\"kind\":\"label\"},{\"id\":\"node-mhsklyq2-fia8q\",\"label\":\"JMBASA\",\"x\":479.23138851997174,\"y\":-177.76984505572872,\"color\":\"#0f172a\",\"width\":190,\"height\":80,\"kind\":\"node\"},{\"id\":\"node-mhskm39h-e5fjt\",\"label\":\"KABANLAKAN\",\"x\":482.3105110347516,\"y\":1.2323148146681433,\"color\":\"#0f172a\",\"width\":190,\"height\":80,\"kind\":\"node\"},{\"id\":\"node-mhskm5h4-18vve\",\"label\":\"CADIZ\",\"x\":482.23019610506486,\"y\":203.99450997718498,\"color\":\"#0f172a\",\"width\":190,\"height\":80,\"kind\":\"node\"},{\"id\":\"label-mhskqo2h-csrod\",\"label\":\"The Rest of South Luzon, Visayas, and Mindanao Network\",\"x\":896.9550853331215,\"y\":-12.479454689078807,\"color\":\"#1e293b\",\"width\":200,\"height\":70,\"kind\":\"label\"}],\"edges\":[{\"id\":\"edge-mhskhcqk-wsmvm\",\"source\":\"label-mhskh5oc-hvexr\",\"target\":\"BACOLOD\",\"sourceHandle\":\"s-top-1\",\"targetHandle\":\"t-left-1\",\"label\":\"\",\"structural\":true,\"loads\":[],\"animated\":false,\"labelT\":0.5},{\"id\":\"edge-mhskhe0t-x9thz\",\"source\":\"label-mhskh5ax-r3s1p\",\"target\":\"label-mhskh5oc-hvexr\",\"sourceHandle\":\"s-top-1\",\"targetHandle\":\"t-bottom-1\",\"label\":\"\",\"structural\":true,\"loads\":[],\"type\":\"straight\",\"animated\":false,\"labelT\":0.5},{\"id\":\"edge-mhskpb3i-a1hw8\",\"source\":\"BACOLOD\",\"target\":\"node-mhsklyq2-fia8q\",\"sourceHandle\":\"s-top-1\",\"targetHandle\":\"t-left-1\",\"label\":\"144C UG/ SUBMARINE via FOBN2\",\"structural\":false,\"loads\":[\"DWDM LAYER 1\",\"DWDM LAYER 2\",\"COHERENT\",\"GALACTUS DP\",\"GALACTUS EP\",\"DODRIO/Nokia\"],\"animated\":true,\"labelT\":0.59},{\"id\":\"edge-mhskpd8c-4nh5w\",\"source\":\"BACOLOD\",\"target\":\"node-mhskm5h4-18vve\",\"sourceHandle\":\"s-bottom-1\",\"targetHandle\":\"t-left-1\",\"label\":\"144C UG & 72C Aerial FOC\",\"structural\":false,\"loads\":[\"DWDM LAYER 1\",\"DWDM LAYER 2\",\"COHERENT\",\"GALACTUS DP\"],\"animated\":true,\"labelT\":0.62},{\"id\":\"edge-mhskpeyd-axpwj\",\"source\":\"BACOLOD\",\"target\":\"node-mhskm39h-e5fjt\",\"sourceHandle\":\"s-right-1\",\"targetHandle\":\"t-left-1\",\"label\":\"72C Aerial & 144C UG via BSC\",\"structural\":false,\"loads\":[\"GALACTUS DP\"],\"type\":\"bezier\",\"animated\":true,\"labelT\":0.54},{\"id\":\"edge-mhskr8j1-33wu6\",\"source\":\"node-mhsklyq2-fia8q\",\"target\":\"label-mhskqo2h-csrod\",\"sourceHandle\":\"s-right-1\",\"targetHandle\":\"t-top-1\",\"label\":\"\",\"structural\":true,\"loads\":[],\"animated\":false,\"labelT\":0.5},{\"id\":\"edge-mhskrbln-yjwr7\",\"source\":\"node-mhskm5h4-18vve\",\"target\":\"label-mhskqo2h-csrod\",\"sourceHandle\":\"s-right-1\",\"targetHandle\":\"t-bottom-1\",\"label\":\"\",\"structural\":true,\"loads\":[],\"animated\":false,\"labelT\":0.5},{\"id\":\"edge-mhsksj5a-oxloj\",\"source\":\"node-mhskm39h-e5fjt\",\"target\":\"label-mhskqo2h-csrod\",\"sourceHandle\":\"s-right-1\",\"targetHandle\":\"t-left-1\",\"label\":\"\",\"structural\":true,\"loads\":[],\"type\":\"bezier\",\"animated\":false,\"labelT\":0.5}]}', '{\"code\":\"BACOLOD\",\"name\":\"Bacolod\",\"updatedAt\":1762820848456}', 1, '2025-11-11 00:27:28', '2025-11-10 03:29:08'),
(7, '{\"nodes\":[{\"id\":\"ORMOR\",\"label\":\"ORMOC\",\"x\":-1.3663427418590004,\"y\":-1.3663427418589436,\"color\":\"#1d4ed8\",\"width\":150,\"height\":60,\"kind\":\"core\"},{\"id\":\"label-mhsrqtr5-fa2lt\",\"label\":\"IPCORE NETWORK\",\"x\":-181.99938025984522,\"y\":102.2668885218913,\"color\":\"#1e293b\",\"width\":200,\"height\":70,\"kind\":\"label\"},{\"id\":\"label-mhsrqyof-tke7y\",\"label\":\"CORE NEs\",\"x\":-182.3326927267804,\"y\":225.26879890989346,\"color\":\"#1e293b\",\"width\":200,\"height\":70,\"kind\":\"label\"},{\"id\":\"node-mhsrrdc6-b6twf\",\"label\":\"TACLOBAN\",\"x\":339.96797189231035,\"y\":-156.16099842460443,\"color\":\"#0f172a\",\"width\":190,\"height\":80,\"kind\":\"node\"},{\"id\":\"node-mhsrrhhq-liye6\",\"label\":\"MAASIN\",\"x\":337.12253700099245,\"y\":191.73792207122148,\"color\":\"#0f172a\",\"width\":190,\"height\":80,\"kind\":\"node\"},{\"id\":\"node-mhsrzm7i-xl6dh\",\"label\":\"CALBAYOG\",\"x\":651.319290481289,\"y\":-155.51529903196865,\"color\":\"#0f172a\",\"width\":190,\"height\":80,\"kind\":\"node\"},{\"id\":\"node-mhsrzq4p-nmw6q\",\"label\":\"TABILARAN\",\"x\":656.3097769762119,\"y\":191.05126350639705,\"color\":\"#0f172a\",\"width\":190,\"height\":80,\"kind\":\"node\"},{\"id\":\"label-mhss0hnw-mam4e\",\"label\":\"FOBN1 NETWORK, (Eastern Visayas, South Luzon & Mindanao Network)\",\"x\":972.3125751298901,\"y\":-193.3566073715449,\"color\":\"#1e293b\",\"width\":160,\"height\":64,\"kind\":\"label\"},{\"id\":\"label-mhss0owj-4oc92\",\"label\":\"FOBN2 NETWORK, (Western Visayas, South Luzon & Mindanao Network)\",\"x\":969.3775108626239,\"y\":161.69241846020498,\"color\":\"#1e293b\",\"width\":166,\"height\":60,\"kind\":\"label\"}],\"edges\":[{\"id\":\"edge-mhsrs3tf-tqeru\",\"source\":\"ORMOR\",\"target\":\"node-mhsrrdc6-b6twf\",\"sourceHandle\":\"s-top-1\",\"targetHandle\":\"t-left-1\",\"label\":\"48C AERIAL\",\"structural\":false,\"loads\":[\"DODRIO/Nokia\"],\"type\":\"smoothstep\",\"animated\":true,\"labelT\":0.57},{\"id\":\"edge-mhsrsz9r-zqrh8\",\"source\":\"ORMOR\",\"target\":\"node-mhsrrdc6-b6twf\",\"sourceHandle\":\"s-right-1\",\"targetHandle\":\"t-bottom-1\",\"label\":\"48C UG\",\"structural\":false,\"loads\":[\"DWDM LAYER 1\",\"DWDM LAYER 2\",\"COHERENT\",\"GALACTUS DP\"],\"type\":\"bezier\",\"animated\":true,\"labelT\":0.67},{\"id\":\"edge-mhsrvgxy-vvn4v\",\"source\":\"ORMOR\",\"target\":\"node-mhsrrhhq-liye6\",\"sourceHandle\":\"s-bottom-1\",\"targetHandle\":\"t-left-1\",\"label\":\"144C UG\",\"structural\":false,\"loads\":[\"DWDM LAYER 1\",\"DWDM LAYER 2\",\"DODRIO/Nokia\"],\"animated\":true,\"labelT\":0.6199999999999999},{\"id\":\"edge-mhsrx8f4-kx10l\",\"source\":\"ORMOR\",\"target\":\"node-mhsrrhhq-liye6\",\"sourceHandle\":\"s-right-1\",\"targetHandle\":\"t-top-1\",\"label\":\"48C AERIAL\",\"structural\":false,\"loads\":[\"COHERENT\",\"GALACTUS EP\"],\"type\":\"bezier\",\"animated\":true,\"labelT\":0.65},{\"id\":\"edge-mhsrzwnf-vbjk2\",\"source\":\"node-mhsrrdc6-b6twf\",\"target\":\"node-mhsrzm7i-xl6dh\",\"sourceHandle\":\"s-right-1\",\"targetHandle\":\"t-left-1\",\"label\":\"\",\"structural\":true,\"loads\":[],\"type\":\"straight\",\"animated\":false,\"labelT\":0.5},{\"id\":\"edge-mhsrzyrc-avy6y\",\"source\":\"node-mhsrrhhq-liye6\",\"target\":\"node-mhsrzq4p-nmw6q\",\"sourceHandle\":\"s-right-1\",\"targetHandle\":\"t-left-1\",\"label\":\"\",\"structural\":true,\"loads\":[],\"type\":\"straight\",\"animated\":false,\"labelT\":0.5},{\"id\":\"edge-mhss10n8-9lxf8\",\"source\":\"node-mhsrzm7i-xl6dh\",\"target\":\"label-mhss0hnw-mam4e\",\"sourceHandle\":\"s-right-1\",\"targetHandle\":\"t-left-1\",\"label\":\"\",\"structural\":true,\"loads\":[],\"type\":\"straight\",\"animated\":false,\"labelT\":0.5},{\"id\":\"edge-mhss13cw-5vsx9\",\"source\":\"node-mhsrzq4p-nmw6q\",\"target\":\"label-mhss0owj-4oc92\",\"sourceHandle\":\"s-right-1\",\"targetHandle\":\"t-left-1\",\"label\":\"\",\"structural\":true,\"loads\":[],\"type\":\"straight\",\"animated\":false,\"labelT\":0.5},{\"id\":\"edge-mhss1gm9-qgjf4\",\"source\":\"label-mhss0hnw-mam4e\",\"target\":\"label-mhss0owj-4oc92\",\"sourceHandle\":\"s-bottom-1\",\"targetHandle\":\"t-top-1\",\"label\":\"\",\"structural\":true,\"loads\":[],\"type\":\"straight\",\"animated\":false,\"labelT\":0.5},{\"id\":\"edge-mhss28sj-guzxu\",\"source\":\"label-mhsrqtr5-fa2lt\",\"target\":\"ORMOR\",\"sourceHandle\":\"s-top-1\",\"targetHandle\":\"t-left-1\",\"label\":\"\",\"structural\":true,\"loads\":[],\"animated\":false,\"labelT\":0.5},{\"id\":\"edge-mhss2b7k-apojo\",\"source\":\"label-mhsrqyof-tke7y\",\"target\":\"label-mhsrqtr5-fa2lt\",\"sourceHandle\":\"s-top-1\",\"targetHandle\":\"t-bottom-1\",\"label\":\"\",\"structural\":true,\"loads\":[],\"type\":\"straight\",\"animated\":false,\"labelT\":0.5}]}', '{\"code\":\"ORMOC\",\"name\":\"Ormoc\",\"updatedAt\":1762835864181}', 1, '2025-11-11 04:37:44', '2025-11-10 06:45:54');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `firstname` varchar(100) NOT NULL,
  `lastname` varchar(100) NOT NULL,
  `username` varchar(120) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('guest','user','site_admin','super_admin') NOT NULL DEFAULT 'guest',
  `status` enum('active','inactive') NOT NULL DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `firstname`, `lastname`, `username`, `password`, `role`, `status`, `created_at`, `updated_at`) VALUES
(1, 'CNFM', 'Admin', 'CNFM_Admin', '$2b$10$/3PtkuBo0sogmgYtWzEATef5WzqAph5mVSNwjaLMYLO.dtE1lIoNC', 'super_admin', 'active', '2025-10-28 06:50:13', '2025-11-11 05:19:52');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `link`
--
ALTER TABLE `link`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_link_key` (`site_id`,`linkkey`);

--
-- Indexes for table `linklabel`
--
ALTER TABLE `linklabel`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_label_site` (`site_id`),
  ADD KEY `fk_label_link` (`linkid`);

--
-- Indexes for table `linkload`
--
ALTER TABLE `linkload`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_load_link` (`linkid`);

--
-- Indexes for table `linksegment`
--
ALTER TABLE `linksegment`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_segment_link` (`linkid`);

--
-- Indexes for table `region`
--
ALTER TABLE `region`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`);

--
-- Indexes for table `site`
--
ALTER TABLE `site`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`),
  ADD KEY `fk_site_region` (`region_id`);

--
-- Indexes for table `siteservice`
--
ALTER TABLE `siteservice`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_siteservice_site` (`site_id`);

--
-- Indexes for table `site_admins`
--
ALTER TABLE `site_admins`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_site_admins_site_user` (`site_id`,`user_id`),
  ADD KEY `idx_site_admins_user` (`user_id`),
  ADD KEY `idx_site_admins_assigned_by` (`assigned_by`);

--
-- Indexes for table `staticpath`
--
ALTER TABLE `staticpath`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_staticpath_site` (`site_id`);

--
-- Indexes for table `topologydraft`
--
ALTER TABLE `topologydraft`
  ADD PRIMARY KEY (`site_id`);

--
-- Indexes for table `topologypublished`
--
ALTER TABLE `topologypublished`
  ADD PRIMARY KEY (`site_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `link`
--
ALTER TABLE `link`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=402;

--
-- AUTO_INCREMENT for table `linklabel`
--
ALTER TABLE `linklabel`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=278;

--
-- AUTO_INCREMENT for table `linkload`
--
ALTER TABLE `linkload`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=487;

--
-- AUTO_INCREMENT for table `linksegment`
--
ALTER TABLE `linksegment`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=402;

--
-- AUTO_INCREMENT for table `region`
--
ALTER TABLE `region`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `site`
--
ALTER TABLE `site`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `siteservice`
--
ALTER TABLE `siteservice`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT for table `site_admins`
--
ALTER TABLE `site_admins`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `staticpath`
--
ALTER TABLE `staticpath`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `link`
--
ALTER TABLE `link`
  ADD CONSTRAINT `fk_link_site` FOREIGN KEY (`site_id`) REFERENCES `site` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `linklabel`
--
ALTER TABLE `linklabel`
  ADD CONSTRAINT `fk_label_link` FOREIGN KEY (`linkid`) REFERENCES `link` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_label_site` FOREIGN KEY (`site_id`) REFERENCES `site` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `linkload`
--
ALTER TABLE `linkload`
  ADD CONSTRAINT `fk_load_link` FOREIGN KEY (`linkid`) REFERENCES `link` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `linksegment`
--
ALTER TABLE `linksegment`
  ADD CONSTRAINT `fk_segment_link` FOREIGN KEY (`linkid`) REFERENCES `link` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `site`
--
ALTER TABLE `site`
  ADD CONSTRAINT `fk_site_region` FOREIGN KEY (`region_id`) REFERENCES `region` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `siteservice`
--
ALTER TABLE `siteservice`
  ADD CONSTRAINT `fk_siteservice_site` FOREIGN KEY (`site_id`) REFERENCES `site` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `site_admins`
--
ALTER TABLE `site_admins`
  ADD CONSTRAINT `fk_site_admins_assigned_by` FOREIGN KEY (`assigned_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_site_admins_site` FOREIGN KEY (`site_id`) REFERENCES `site` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_site_admins_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `staticpath`
--
ALTER TABLE `staticpath`
  ADD CONSTRAINT `fk_staticpath_site` FOREIGN KEY (`site_id`) REFERENCES `site` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `topologydraft`
--
ALTER TABLE `topologydraft`
  ADD CONSTRAINT `fk_topologydraft_site` FOREIGN KEY (`site_id`) REFERENCES `site` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `topologypublished`
--
ALTER TABLE `topologypublished`
  ADD CONSTRAINT `fk_topologypublished_site` FOREIGN KEY (`site_id`) REFERENCES `site` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
