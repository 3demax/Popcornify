Description
===========  
Popcornify is a program to let you stream video from torrents.

Installation
============  
This is a node-webkit application, so you need to [download that first](https://github.com/rogerwang/node-webkit#downloads).  
Then, in a project directory, run  
```
$ npm install 
```  
to install all dependencies.  
Now you can run project by passing it's directory to nw binary.  
```
$ nw popcornify/
```

Packaging a binary
=================  
Optionally you can package a binary.
First, create a package while inside a project's directory:
```
$ zip app.nw *
```  
Then merge it with nw binary. In *nix you would do this:  
```
$ cat nw app.nw > popcornify
$ chmod +x popcornify
```  
Find more on this in [How-to-package-and-distribute-your-apps](https://github.com/rogerwang/node-webkit/wiki/How-to-package-and-distribute-your-apps)