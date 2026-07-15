import 'package:flutter/material.dart';
import 'screens/welcome_screen.dart';

void main() {
  runApp(const CareLinkApp());
}

class CareLinkApp extends StatelessWidget {
  const CareLinkApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'CareLink',
      theme: ThemeData(
        primarySwatch: Colors.blue,
        useMaterial3: true,
      ),
      home: const WelcomeScreenWidget(),
      debugShowCheckedModeBanner: false,
    );
  }
}
