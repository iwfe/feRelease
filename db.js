mongodb

  user 用户表
    id uuid生成的唯一id
    name 用户名称
    pwd 用户密码
    test 关注的项目id数组集合
    beta 关注的项目id数组集合
    prod 关注的项目id数组集合

  menu 菜单表
    id uuid生成唯一id
    name 菜单名称
    test 菜单下的项目id数组集合
    beta 菜单下的项目id数组集合
    prod 菜单下的项目id数组集合
    createTime 创建时间
    updateTime 更新时间

    path 前端路由匹配的路径
    des 图标文字
    ico 图标颜色

  logger 日志表 （查询条件 dev, userid）
    dev 不同环境test，beta，prod
    name 目录名称（对应阿里云下的目录名，不是项目名称）
    version 版本号
    userid 用户id
    timer 上传的时间

mysql
  hims_test
  hims_beta

  iw_static_project 项目集合
    CREATE TABLE `iw_static_project` (
      `id` bigint(20) NOT NULL AUTO_INCREMENT,
      `name` varchar(50) NOT NULL COMMENT '项目名称',
      `folderName` varchar(50) NOT NULL COMMENT '根目录名',
      `version` varchar(20) NOT NULL DEFAULT '0',
      `memo` varchar(255) NOT NULL,
      `createTime` datetime NOT NULL,
      `updateTime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, // 修改后自动更新时间戳
      `propertiesPath` varchar(500) DEFAULT NULL COMMENT '映射文件oss路径',
      `onoffPath` varchar(500) DEFAULT NULL COMMENT '是否自动更新资源开关文件',
      `onoff` int(11) DEFAULT '0' COMMENT '自动更新开关 0-关闭 1-开启',
      `ossType` int(11) NOT NULL DEFAULT '1' COMMENT 'ossCDN类型：1：iwjw ； 2：fyb',
      `versionType` int(11) NOT NULL DEFAULT '0' COMMENT '版本管理方式0-自动管理；1-手动管理',
      `isDelete` tinyint(1) NOT NULL DEFAULT '0' COMMENT '是否已删除0-正常；1-已删除',
      `parentId` bigint(20) NOT NULL DEFAULT '0' COMMENT '上级项目ID',
      PRIMARY KEY (`id`),
      UNIQUE KEY `key_name_uin` (`name`,`isDelete`)
    ) ENGINE=InnoDB AUTO_INCREMENT=138 DEFAULT CHARSET=utf8;
    {
      createTime: "2017-02-14 14:54:45"
      folderName: "iwjw-finwxent"
      id: 97
      isDelete: 0
      memo: "鹊桥贷企业号前端资源文件"
      name: "鹊桥贷企业号前端资源"
      onoff:1
      onoffPath: "//house-test-water.oss.aliyuncs.com/resource/iwjw-finwxent_test/staticResourceConfig.properties"
      ossType: 1
      parentId:0
      propertiesPath: "//house-test-water.oss.aliyuncs.com/resource/iwjw-finwxent_test/staticResource.properties"
      updateTime:"2017-09-27 17:14:14"
      version:"140"
      versionType:2
    }

  iw_static_resource 静态文件集合
    CREATE TABLE `iw_static_resource` (
      `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT 'ID',
      `keyPath` varchar(255) NOT NULL COMMENT '固定文件名',
      `ossUrl` varchar(500) NOT NULL COMMENT 'oss实际路径',
      `version` varchar(20) NOT NULL DEFAULT '0',
      `projectId` bigint(20) NOT NULL COMMENT '文件所属系统ID',
      `createTime` datetime NOT NULL,
      `updateTime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      `fileMd5` varchar(200) DEFAULT NULL COMMENT '文件MD5值',
      PRIMARY KEY (`id`),
      UNIQUE KEY `res_key_uni` (`keyPath`,`projectId`) USING BTREE
    ) ENGINE=InnoDB AUTO_INCREMENT=70381 DEFAULT CHARSET=utf8;
    {
      id: 100,
      keyPath: 'baike.js',
      ossUrl: '//house-test-water.oss.aliyuncs.com/resource/iwjw-h5_test/baike_352.js',
      version: '352',
      projectId: '24',
      createTime: '2015-12-02 15:06:33',
      updateTime: '2015-12-02 15:06:33',
      fileMd5: 'kjsadhfkashdfk'
    }

  iw_static_manifest 不需要加版本号的项目
    CREATE TABLE `iw_static_manifest` (
      `id` bigint(20) NOT NULL AUTO_INCREMENT,
      `keyPath` varchar(255) NOT NULL COMMENT '固定文件名',
      `ossUrl` varchar(500) NOT NULL COMMENT 'oss实际路径',
      `version` varchar(20) NOT NULL COMMENT '版本',
      `projectId` bigint(20) NOT NULL COMMENT '项目id',
      `createTime` datetime NOT NULL,
      `updateTime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      `fileMd5` varchar(200) NOT NULL COMMENT '文件MD5值',
      PRIMARY KEY (`id`),
      KEY `index_keyPath` (`keyPath`),
      KEY `res_key_uni` (`keyPath`,`projectId`)
    ) ENGINE=InnoDB AUTO_INCREMENT=84 DEFAULT CHARSET=utf8 COMMENT='manifest版本信息';
    // 打包生成 manifest.json 具体操作看上传接口
    {
      "versionFiles": [
        "vendor.css",
        "vendor.js",
        "app.css",
        "app.js"
      ],
      "hashNum": 7,
      "assets": {
        "iconfont.svg?t=1505790523739": "iconfont.7cd8128.svg",
        "me_default.jpg": "me_default.394c31a.jpg",
        "error.js": "error.1d2271546e1fa3289a71.js",
        "signin.js": "signin.b5e31895a29397e9a1f4.js",
        "all.js": "all.2cb30c6ddde7ffd95829.js",
        "listview.js": "listview.f82e0d80637a9f5231d8.js",
        "home.js": "home.2f810e7c4120e21aafc3.js"
      }
    }

  ps:所有上传到阿里云的项目，不可以换目录，只能手动删除文件和文件夹


