/*
Navicat MySQL Data Transfer

Source Server         : localhost
Source Server Version : 50717
Source Host           : localhost:3306
Source Database       : vue_dm_db

Target Server Type    : MYSQL
Target Server Version : 50717
File Encoding         : 65001

Date: 2017-09-26 14:37:48
*/

SET FOREIGN_KEY_CHECKS=0;

-- ----------------------------
-- Table structure for t_access
-- ----------------------------
DROP TABLE IF EXISTS `t_access`;
CREATE TABLE `t_access` (
  `tid` int(11) NOT NULL AUTO_INCREMENT,
  `access_count` int(11) DEFAULT NULL,
  `access_date` varchar(12) DEFAULT NULL,
  PRIMARY KEY (`tid`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of t_access
-- ----------------------------
INSERT INTO `t_access` VALUES ('3', '100', '2017-09-26');

-- ----------------------------
-- Table structure for t_admin
-- ----------------------------
DROP TABLE IF EXISTS `t_admin`;
CREATE TABLE `t_admin` (
  `tid` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(40) DEFAULT NULL,
  `password` varchar(50) DEFAULT NULL,
  `role_id` int(11) DEFAULT NULL,
  `is_use` tinyint(4) DEFAULT NULL,
  `realname` varchar(40) DEFAULT NULL,
  PRIMARY KEY (`tid`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of t_admin
-- ----------------------------
INSERT INTO `t_admin` VALUES ('2', 'user2', 'd033e22ae348aeb5660fc2140aec35850c4da997', '13', '1', 'user2');
INSERT INTO `t_admin` VALUES ('5', 'admin', 'd033e22ae348aeb5660fc2140aec35850c4da997', '18', '1', 'admin');
INSERT INTO `t_admin` VALUES ('6', 'user1', 'd033e22ae348aeb5660fc2140aec35850c4da997', '12', '1', '123');

-- ----------------------------
-- Table structure for t_data_count
-- ----------------------------
DROP TABLE IF EXISTS `t_data_count`;
CREATE TABLE `t_data_count` (
  `tid` int(11) NOT NULL AUTO_INCREMENT,
  `data_count` int(11) DEFAULT NULL,
  `date` varchar(12) DEFAULT NULL,
  PRIMARY KEY (`tid`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of t_data_count
-- ----------------------------
INSERT INTO `t_data_count` VALUES ('1', '3000', '2017-09-26');

-- ----------------------------
-- Table structure for t_resource
-- ----------------------------
DROP TABLE IF EXISTS `t_resource`;
CREATE TABLE `t_resource` (
  `tid` int(11) NOT NULL AUTO_INCREMENT,
  `resource_name` varchar(20) DEFAULT NULL,
  `resource_description` varchar(40) DEFAULT NULL,
  `permission_url` varchar(60) DEFAULT NULL,
  `disabled` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`tid`)
) ENGINE=InnoDB AUTO_INCREMENT=57 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of t_resource
-- ----------------------------
INSERT INTO `t_resource` VALUES ('1', '查看角色', '查看所有的角色列表', 'admin/system/role/create/*', '1');
INSERT INTO `t_resource` VALUES ('2', '添加角色', '添加一个新的角色', 'admin/system/role/add/*', '1');
INSERT INTO `t_resource` VALUES ('3', '编辑角色', '编辑已有角色的权限列表', 'admin/system/role/edit/*', '1');
INSERT INTO `t_resource` VALUES ('4', '删除角色', '删除一个已有的角色', 'admin/system/role/del/*', '1');
INSERT INTO `t_resource` VALUES ('5', '查看用户', '查看所有的用户列表', 'admin/system/user/create/*', '1');
INSERT INTO `t_resource` VALUES ('6', '添加用户', '添加一个新的用户', 'admin/system/user/add/*', '1');
INSERT INTO `t_resource` VALUES ('7', '启用用户', '启用一个已有用户', 'admin/system/user/enabled/*', '1');
INSERT INTO `t_resource` VALUES ('8', '禁用用户', '禁用一个已有用户', 'admin/system/user/disabled/*', '1');
INSERT INTO `t_resource` VALUES ('9', '删除用户', '删除一个已有用户', 'admin/system/user/del/*', '1');
INSERT INTO `t_resource` VALUES ('10', '编辑用户', '修改一个已有用户的所属角色', 'admin/system/user/edit/*', '1');
INSERT INTO `t_resource` VALUES ('12', '所有权限', '测试用的所有权限', 'admin/*', '1');
INSERT INTO `t_resource` VALUES ('21', '个人信息表-查看', '查看个人信息表数据', 'admin/data/table/个人信息表/create/*', '0');
INSERT INTO `t_resource` VALUES ('22', '个人信息表-添加', '添加个人信息表数据', 'admin/data/table/个人信息表/add/*', '0');
INSERT INTO `t_resource` VALUES ('23', '个人信息表-编辑', '编辑个人信息表数据', 'admin/data/table/个人信息表/edit/*', '0');
INSERT INTO `t_resource` VALUES ('24', '个人信息表-删除', '删除个人信息表数据', 'admin/data/table/个人信息表/del/*', '0');

-- ----------------------------
-- Table structure for t_role
-- ----------------------------
DROP TABLE IF EXISTS `t_role`;
CREATE TABLE `t_role` (
  `tid` int(11) NOT NULL AUTO_INCREMENT,
  `nick_name` varchar(20) DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`tid`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of t_role
-- ----------------------------
INSERT INTO `t_role` VALUES ('13', '普通用户', '普通权限');
INSERT INTO `t_role` VALUES ('16', '潮神', 'dota');
INSERT INTO `t_role` VALUES ('18', '超级管理员', '系统的最高级别角色');
INSERT INTO `t_role` VALUES ('19', 'GAI', '没有描述');

-- ----------------------------
-- Table structure for t_role_resource
-- ----------------------------
DROP TABLE IF EXISTS `t_role_resource`;
CREATE TABLE `t_role_resource` (
  `tid` int(11) NOT NULL AUTO_INCREMENT,
  `role_id` int(11) DEFAULT NULL,
  `resource_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`tid`)
) ENGINE=InnoDB AUTO_INCREMENT=150 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of t_role_resource
-- ----------------------------
INSERT INTO `t_role_resource` VALUES ('47', '18', '1');
INSERT INTO `t_role_resource` VALUES ('48', '18', '2');
INSERT INTO `t_role_resource` VALUES ('49', '18', '3');
INSERT INTO `t_role_resource` VALUES ('50', '18', '4');
INSERT INTO `t_role_resource` VALUES ('51', '18', '5');
INSERT INTO `t_role_resource` VALUES ('52', '18', '6');
INSERT INTO `t_role_resource` VALUES ('53', '18', '7');
INSERT INTO `t_role_resource` VALUES ('54', '18', '8');
INSERT INTO `t_role_resource` VALUES ('55', '18', '9');
INSERT INTO `t_role_resource` VALUES ('56', '18', '10');
INSERT INTO `t_role_resource` VALUES ('61', '18', '12');
INSERT INTO `t_role_resource` VALUES ('62', '18', '21');
INSERT INTO `t_role_resource` VALUES ('63', '18', '22');
INSERT INTO `t_role_resource` VALUES ('64', '18', '23');
INSERT INTO `t_role_resource` VALUES ('65', '18', '24');
INSERT INTO `t_role_resource` VALUES ('138', '13', '21');
INSERT INTO `t_role_resource` VALUES ('139', '13', '22');
INSERT INTO `t_role_resource` VALUES ('140', '13', '23');
INSERT INTO `t_role_resource` VALUES ('141', '13', '24');

-- ----------------------------
-- Table structure for t_select
-- ----------------------------
DROP TABLE IF EXISTS `t_select`;
CREATE TABLE `t_select` (
  `tid` int(11) NOT NULL AUTO_INCREMENT,
  `select_key` varchar(100) DEFAULT NULL,
  `select_value` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`tid`)
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of t_select
-- ----------------------------
INSERT INTO `t_select` VALUES ('4', '个人信息表_性别', '男');
INSERT INTO `t_select` VALUES ('5', '个人信息表_性别', '女');
INSERT INTO `t_select` VALUES ('9', '个人信息表_籍贯', '兴国');
INSERT INTO `t_select` VALUES ('10', '个人信息表_籍贯', '南昌');
INSERT INTO `t_select` VALUES ('11', '个人信息表_籍贯', '赣州');

-- ----------------------------
-- Table structure for t_table
-- ----------------------------
DROP TABLE IF EXISTS `t_table`;
CREATE TABLE `t_table` (
  `tid` int(11) NOT NULL AUTO_INCREMENT,
  `parent_code` int(11) DEFAULT NULL,
  `name` varchar(64) DEFAULT NULL,
  `is_table` int(1) DEFAULT NULL,
  PRIMARY KEY (`tid`)
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of t_table
-- ----------------------------
INSERT INTO `t_table` VALUES ('1', '0', '安检部', '0');
INSERT INTO `t_table` VALUES ('5', '0', '护卫部', '0');
INSERT INTO `t_table` VALUES ('8', '0', '其他部', '0');
INSERT INTO `t_table` VALUES ('9', '8', '其他一部123', '0');
INSERT INTO `t_table` VALUES ('11', '9', '内容测试123', '0');
INSERT INTO `t_table` VALUES ('14', '5', '个人信息表', '1');
INSERT INTO `t_table` VALUES ('16', '0', '根目录', '0');

-- ----------------------------
-- Table structure for 个人信息表
-- ----------------------------
DROP TABLE IF EXISTS `个人信息表`;
CREATE TABLE `个人信息表` (
  `tid` int(11) NOT NULL AUTO_INCREMENT,
  `text_姓名` varchar(255) DEFAULT NULL,
  `text_班级编号` varchar(255) DEFAULT NULL,
  `select_性别` varchar(255) DEFAULT NULL,
  `date_出生年月` datetime DEFAULT NULL,
  `img_照片` text,
  `select_籍贯` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`tid`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of 个人信息表
-- ----------------------------
INSERT INTO `个人信息表` VALUES ('1', '名称1', '132013', '男', '2017-09-05 10:26:44', null, '南昌');
INSERT INTO `个人信息表` VALUES ('2', '名称2', '132013', '女', '2017-09-12 10:27:20', null, '赣州');
INSERT INTO `个人信息表` VALUES ('3', '名称31', '132013', '女', '2017-09-21 10:27:23', null, '南昌');
INSERT INTO `个人信息表` VALUES ('4', '小哥', '13201318', '男', '2017-09-14 00:00:00', '', '南昌');
