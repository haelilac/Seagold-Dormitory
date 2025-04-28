-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: switchback.proxy.rlwy.net:58422
-- Generation Time: Apr 25, 2025 at 05:11 AM
-- Server version: 9.2.0
-- PHP Version: 8.3.13

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `railway`
--

-- --------------------------------------------------------

--
-- Table structure for table `unit_images`
--

CREATE TABLE `unit_images` (
  `id` int NOT NULL,
  `unit_code` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `image_path` text COLLATE utf8mb4_general_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `unit_images`
--

INSERT INTO `unit_images` (`id`, `unit_code`, `image_path`, `created_at`, `updated_at`) VALUES
(50, 'Room 7 - C', 'https://res.cloudinary.com/dxhthya7z/image/upload/v1745337443/room_images/qanosetlkw2ymf5limh2.jpg', '2025-04-22 23:57:24', '2025-04-22 23:57:24'),
(51, 'Room 7 - C', 'https://res.cloudinary.com/dxhthya7z/image/upload/v1745337449/room_images/r5ljzc4rvxzwzortd7tj.jpg', '2025-04-22 23:57:30', '2025-04-22 23:57:30'),
(52, 'Room 7 - C', 'https://res.cloudinary.com/dxhthya7z/image/upload/v1745337458/room_images/bhqhp4xsux85fnxg36lt.jpg', '2025-04-22 23:57:38', '2025-04-22 23:57:38'),
(53, 'Room 7 - B', 'https://res.cloudinary.com/dxhthya7z/image/upload/v1745337634/room_images/okwfuexyghbiwckruogc.png', '2025-04-23 00:00:35', '2025-04-23 00:00:35'),
(54, 'Room 7 - B', 'https://res.cloudinary.com/dxhthya7z/image/upload/v1745337641/room_images/hhcdaayzvay9uurz2gqi.png', '2025-04-23 00:00:42', '2025-04-23 00:00:42'),
(55, 'Room 7 - B', 'https://res.cloudinary.com/dxhthya7z/image/upload/v1745337647/room_images/es1bro4fo7hh80dd8hca.jpg', '2025-04-23 00:00:48', '2025-04-23 00:00:48'),
(56, 'Room 7 - A', 'https://res.cloudinary.com/dxhthya7z/image/upload/v1745342664/room_images/mqrojwnnphjhx3x6a9jm.png', '2025-04-23 01:24:25', '2025-04-23 01:24:25'),
(57, 'Room 7 - A', 'https://res.cloudinary.com/dxhthya7z/image/upload/v1745342674/room_images/ipetr6xptxcy5ddkzgmq.png', '2025-04-23 01:24:34', '2025-04-23 01:24:34'),
(58, 'Room 7 - A', 'https://res.cloudinary.com/dxhthya7z/image/upload/v1745342680/room_images/subhhv9hclh5lfsqwpdg.jpg', '2025-04-23 01:24:40', '2025-04-23 01:24:40'),
(59, 'Room 6', 'https://res.cloudinary.com/dxhthya7z/image/upload/v1745343776/room_images/xxjelildmsm3pf7nvzho.jpg', '2025-04-23 01:42:57', '2025-04-23 01:42:57'),
(60, 'Room 6', 'https://res.cloudinary.com/dxhthya7z/image/upload/v1745343782/room_images/kwtlohmeawbfjv1wpchq.jpg', '2025-04-23 01:43:02', '2025-04-23 01:43:02'),
(61, 'Room 6', 'https://res.cloudinary.com/dxhthya7z/image/upload/v1745343787/room_images/nnthfqoaaao8e4szbjtw.jpg', '2025-04-23 01:43:08', '2025-04-23 01:43:08'),
(62, 'Room 5', 'https://res.cloudinary.com/dxhthya7z/image/upload/v1745343879/room_images/zyvxtumdskognrhnvzgn.jpg', '2025-04-23 01:44:40', '2025-04-23 01:44:40'),
(63, 'Room 5', 'https://res.cloudinary.com/dxhthya7z/image/upload/v1745343885/room_images/c8vlxviudhscmuxyj7y8.jpg', '2025-04-23 01:44:45', '2025-04-23 01:44:45'),
(64, 'Room 5', 'https://res.cloudinary.com/dxhthya7z/image/upload/v1745343890/room_images/p8p7zjugt6vwgxx7jzjo.jpg', '2025-04-23 01:44:51', '2025-04-23 01:44:51'),
(65, 'Room 4', 'https://res.cloudinary.com/dxhthya7z/image/upload/v1745344336/room_images/mepp4yvlupnbx9hafiov.jpg', '2025-04-23 01:52:16', '2025-04-23 01:52:16'),
(66, 'Room 4', 'https://res.cloudinary.com/dxhthya7z/image/upload/v1745344341/room_images/kbbw8kavbxpgba2bxcsx.jpg', '2025-04-23 01:52:22', '2025-04-23 01:52:22'),
(67, 'Room 4', 'https://res.cloudinary.com/dxhthya7z/image/upload/v1745344347/room_images/zpra9ufyvd45ok5ql6xq.jpg', '2025-04-23 01:52:27', '2025-04-23 01:52:27'),
(70, 'Room 2', 'https://res.cloudinary.com/dxhthya7z/image/upload/v1745347581/room_images/vfiy23upad9yfvctzdzj.png', '2025-04-23 02:46:22', '2025-04-23 02:46:22'),
(71, 'Room 1', 'https://res.cloudinary.com/dxhthya7z/image/upload/v1745347674/room_images/dwyfcsf6fhobamu2oulb.png', '2025-04-23 02:47:54', '2025-04-23 02:47:54'),
(72, 'Room 3', 'https://res.cloudinary.com/dxhthya7z/image/upload/v1745347821/room_images/hos7fcwcqmwg2opwy47d.png', '2025-04-23 02:50:22', '2025-04-23 02:50:22');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `unit_images`
--
ALTER TABLE `unit_images`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `unit_images`
--
ALTER TABLE `unit_images`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=73;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
