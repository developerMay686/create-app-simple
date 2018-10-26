const spawn = require('cross-spawn'); // 解决跨平台使用npm命令的问题的模块
const chalk = require('chalk'); // 实现控制台彩色文字输出的模块。
const os = require('os');
const fs = require('fs-extra'); // 系统模块fs的扩展，实现了一些fs模块不包含的文件操作（比如递归复制、删除等等）的模块
const path = require('path'); // nodeJs的path模块，提供了一些工具函数，用于处理文件与目录的路径
// 实现命令行传入参数预处理的模块。
const commander = require('commander');
// 对于用户输入的工程名的可用性进行验证的模块
const validateProjectName = require('validate-npm-package-name');
const packageJson = require('../package.json');

let projectName;
let devDependencies = ['webpack', 'webpack-cli', 'mini-css-extract-plugin', 'html-webpack-plugin', 
'clean-webpack-plugin', 'webpack-dev-server', 'css-loader', 'webpack-merge', 'style-loader', '@babel/core', 
'@babel/preset-env', '@babel/preset-react', 'babel-loader', 'babel-polyfill'];

let dependencies = ['react', 'react-dom'];

// 模板复制函数
function copyTemplates() {
    try {
        if (!fs.existsSync(path.resolve(__dirname, '../templates'))) {
            console.log(chalk.red('Cannot find the template files !'));
            process.exit(1); // .exit(非0)表示执行失败，回调函数中，err不为null，err.code就是我们传给exit的数字。
        }
        // 注：cwd() 是当前执行node命令时候的文件夹地址，__dirname 是被执行的js 文件的地址
        fs.copySync(path.resolve(__dirname, '../templates'), process.cwd());
        console.log(chalk.green('Template files copied successfully!'));
        return true;
    }
    catch (e) {
        console.log(chalk.red(`Error occured: ${e}`))
    }
}
// package.json的处理函数
function generatePackageJson() {
    let packageJson = {
        name: projectName,
        version: '1.0.0',
        description: '',
        scripts: {
            start: 'webpack-dev-server --open --config webpack.dev.conf.js',
            build: 'webpack --config webpack.prod.conf.js'
        },
        author: '',
        license: ''
    };
    try {
        fs.writeFileSync(path.resolve(process.cwd(), 'package.json'), JSON.stringify(packageJson));
        console.log(chalk.green('Package.json generated successfully!'));
    }
    catch (e) {
        console.log(chalk.red(e))
    }
}
// 安装所有的依赖，分为devDependencies和dependencies
function installAll() {
    console.log(chalk.green('Start installing ...'));
    const child = spawn('npm', ['install', '-D'].concat(devDependencies), {
        stdio: 'inherit' // 代表将子进程的输出管道连接到父进程上，及父进程可以自动接受子进程的输出结果
    });

    child.on('close', function (code) {
        if (code !== 0) {
            console.log(chalk.red('Error occured while installing dependencies!'));
            process.exit(1);
        }
        else {
            const child = spawn('npm', ['install', '--save'].concat(dependencies), {
                stdio: 'inherit'
            })
            child.on('close', function (code) {
                if (code !== 0) {
                    console.log(chalk.red('Error occured while installing dependencies!'));
                    process.exit(1);
                }
                else {
                    console.log(chalk.green('Installation completed successfully!'));
                    console.log();
                    console.log(chalk.green('Start the local server with : '))
                    console.log();
                    console.log(chalk.cyan('    npm run start'))
                    console.log();
                    console.log(chalk.green('or build your app via :'));
                    console.log();
                    console.log(chalk.cyan('    npm run build'));
                }
            })
        }
    });
}

// commander模块实现命令行参数的预处理
// version方法定义了create-react-application -V的输出结果，usage定义了命令行里的用法
// arguments定义了程序所接受的默认参数，然后在action函数回调中处理了这个默认参数，
// allowUnknownOption表示接受多余参数，parse表示把多余未解析的参数解析到process.argv中去
const program = commander
    .version(packageJson.version)
    .usage(' [options]')
    .arguments('<project-name>')
    .action(name => {
        console.log(name);
        projectName = name;
        process.argv.forEach((val, index) => {
            console.log(`索引${index}: ${val}`);
        });
    })
    .allowUnknownOption()
    .parse(process.argv); // process.argv 属性返回一个数组，这个数组包含了启动Node.js进程时的命令行参数

if (projectName == undefined) {
    console.log(chalk.red('Please pass the project name while using create-react!'));
    console.log(chalk.green('for example:'))
    console.log();
    console.log('   create-react-application ' + chalk.yellow('<react-app>'));
}
else {
    const validateResult = validateProjectName(projectName);
    if (validateResult.validForNewPackages) {
        copyTemplates();
        generatePackageJson();
        installAll();
        //console.log(chalk.green(`Congratulations! React app has been created successfully in ${process.cwd()}`));
    }
    else {
        console.log(chalk.red('The project name given is invalid!'));
        process.exit(1);
    }
}