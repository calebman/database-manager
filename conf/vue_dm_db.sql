/*
Navicat MySQL Data Transfer

Source Server         : localhost
Source Server Version : 50717
Source Host           : localhost:3306
Source Database       : vue_dm_db

Target Server Type    : MYSQL
Target Server Version : 50717
File Encoding         : 65001

Date: 2017-09-08 16:14:58
*/

SET FOREIGN_KEY_CHECKS=0;

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
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of t_admin
-- ----------------------------
INSERT INTO `t_admin` VALUES ('2', 'user2', 'd033e22ae348aeb5660fc2140aec35850c4da997', '13', '1', 'user2');
INSERT INTO `t_admin` VALUES ('5', 'admin', 'd033e22ae348aeb5660fc2140aec35850c4da997', '18', '1', 'admin');

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
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8;

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
INSERT INTO `t_resource` VALUES ('11', '表格权限', null, 'admin/data/table/*', '0');

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
) ENGINE=InnoDB AUTO_INCREMENT=61 DEFAULT CHARSET=utf8;

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
INSERT INTO `t_role_resource` VALUES ('57', '18', '11');
INSERT INTO `t_role_resource` VALUES ('60', '13', '11');

-- ----------------------------
-- Table structure for t_select
-- ----------------------------
DROP TABLE IF EXISTS `t_select`;
CREATE TABLE `t_select` (
  `tid` int(11) NOT NULL AUTO_INCREMENT,
  `select_key` varchar(100) DEFAULT NULL,
  `select_value` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`tid`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of t_select
-- ----------------------------
INSERT INTO `t_select` VALUES ('1', '测试表格_选择列', '苹果');
INSERT INTO `t_select` VALUES ('2', '测试表格_选择列', '香蕉');
INSERT INTO `t_select` VALUES ('3', '测试表格_选择列', '梨');

-- ----------------------------
-- Table structure for t_table
-- ----------------------------
DROP TABLE IF EXISTS `t_table`;
CREATE TABLE `t_table` (
  `tid` int(11) NOT NULL AUTO_INCREMENT,
  `parent_code` int(11) DEFAULT NULL,
  `name` varchar(64) DEFAULT NULL,
  PRIMARY KEY (`tid`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of t_table
-- ----------------------------
INSERT INTO `t_table` VALUES ('1', '0', '安检部');
INSERT INTO `t_table` VALUES ('2', '1', '测试表格');
INSERT INTO `t_table` VALUES ('3', '1', '测试表格二');
INSERT INTO `t_table` VALUES ('4', '1', '测试表格三');
INSERT INTO `t_table` VALUES ('5', '0', '护卫部');
INSERT INTO `t_table` VALUES ('6', '5', '测试表格四');
INSERT INTO `t_table` VALUES ('7', '5', '测试表格五');
INSERT INTO `t_table` VALUES ('8', '0', '其他部');
INSERT INTO `t_table` VALUES ('9', '8', '其他一部');
INSERT INTO `t_table` VALUES ('10', '8', '其他二部');
INSERT INTO `t_table` VALUES ('11', '9', '内容测试');
INSERT INTO `t_table` VALUES ('12', '11', '测试表格六');
INSERT INTO `t_table` VALUES ('13', '10', '测试表格七');

-- ----------------------------
-- Table structure for 测试表格
-- ----------------------------
DROP TABLE IF EXISTS `测试表格`;
CREATE TABLE `测试表格` (
  `tid` int(11) NOT NULL AUTO_INCREMENT,
  `text_文本列` varchar(255) DEFAULT NULL,
  `number_数字列` int(11) DEFAULT NULL,
  `date_时间列` datetime DEFAULT NULL,
  `select_选择列` varchar(255) DEFAULT NULL,
  `img_图片列` text,
  PRIMARY KEY (`tid`)
) ENGINE=InnoDB AUTO_INCREMENT=218 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of 测试表格
-- ----------------------------
INSERT INTO `测试表格` VALUES ('114', '文本123', '123', '2017-08-15 10:58:37', '香蕉', 'upload/20170831/14618c8196de4a9480e1a928e44a3cd8.jpg');
INSERT INTO `测试表格` VALUES ('115', '文本1324', '12', '2017-08-15 10:58:37', '香蕉', 'upload/20170831/2012feb6c45643c48a31313920bcca9a.jpg');
INSERT INTO `测试表格` VALUES ('117', '文本12', '12', '2017-08-15 10:58:37', '香蕉', 'upload/20170901/f5063dd1523a4d85864f792a0f56d94a.jpg');
INSERT INTO `测试表格` VALUES ('118', '文本1', '12', '2017-08-15 10:58:37', '苹果', 'upload/20170901/4b21f0c35251473e9f143f3a78fcc5f5.jpg');
INSERT INTO `测试表格` VALUES ('119', '文本1', '12', '2017-08-15 10:58:37', '苹果', 'upload/20170901/f091748ac6dc4afc92a3c3aa2af23b59.jpg');
INSERT INTO `测试表格` VALUES ('120', '文本1', '12', '2017-08-15 10:58:37', '香蕉', 'upload/20170901/ea3fc2ed0f504509978a5c30965fa8c2.jpg');
INSERT INTO `测试表格` VALUES ('207', '测试文本', '123', '2017-08-25 00:00:00', '苹果', 'upload/20170901/442e9cb01e9b429fa4c0d1539dbf6a57.jpg');
INSERT INTO `测试表格` VALUES ('208', '123', '123', '2017-09-13 00:00:00', '香蕉', 'upload/20170902/df9197cb693245838e690e784cc6b6f0.jpg;upload/20170902/cf8cc82585354de38997ed85ce585de9.jpg;upload/20170902/28ecdfad30634a66b2cf967d347fddb3.jpg');
INSERT INTO `测试表格` VALUES ('209', '123', '3', '2017-09-02 00:00:00', '梨', 'upload/20170902/47731aa624154e73849f545d34977a8f.jpg;upload/20170902/d88d2772aaa94038a00f1e05cdddf50c.jpg');
INSERT INTO `测试表格` VALUES ('210', '234', '245', '2017-09-07 00:00:00', '香蕉', 'upload/20170902/2133891c8f994ef5b4466a4283487c90.jpg;upload/20170902/65f69e2f0061407ea0c076e83e923151.jpg;upload/20170902/93a3dad8141b477aa7af0b603147bc74.jpg;upload/20170902/2c868fb1e1204d30abdbb26463b9b0b1.jpg');
INSERT INTO `测试表格` VALUES ('211', '345', '345', '2017-09-13 00:00:00', '香蕉', 'upload/20170902/5481fcb4eb6a4fdf821149dab297e9ba.jpg;upload/20170902/5007be51b80045adab772e0a498ed0ea.jpg;upload/20170902/a04c2928242040628343c85a11aec091.jpg');
INSERT INTO `测试表格` VALUES ('212', '456', '456', '2017-09-02 10:47:42', '香蕉', 'upload/20170902/f04b70b1563c4e22884a1b54452be60c.jpg;upload/20170902/87246c505fda4a528ee9fb2ac439cfe9.jpg;upload/20170902/c0f6fa2bd85f46668930786a7d6fa6b1.jpg');
INSERT INTO `测试表格` VALUES ('213', '123', '123', '2017-09-04 10:48:08', '香蕉', 'upload/20170902/c2df7ffc14814584bb60c534c7c69a81.jpg;upload/20170902/f720ad2b3d7b43368ae466a8a81464a6.jpg;upload/20170902/e744d8ba3a8a460fa1e317f11e8dbfb3.jpg;upload/20170902/d0563eee7d614c4382a136a02d483b10.jpg;upload/20170908/bb2194f2ecfd49b3b9fd430baeaf645c.jpg');
INSERT INTO `测试表格` VALUES ('214', '123', '123', '2017-09-22 12:00:00', '香蕉', 'upload/20170902/5ca4d197337d4656a7f1216657bb5c35.jpg');
INSERT INTO `测试表格` VALUES ('216', '123', '123', '2017-08-29 00:00:00', '梨', 'upload/20170902/248c8d67696948c6983a64bddf094aca.jpg;upload/20170902/f202662674224f9ea3d5107e836715c7.jpg');
INSERT INTO `测试表格` VALUES ('217', 'as返回北京开始部分进口设备防控技术部分加扣税大部分可就是打不开机房刷卡缴费不上课简单方便会计师部分开始加班', '123', '2017-09-14 00:00:00', '梨', '');
