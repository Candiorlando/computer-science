import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class FlutterFlowTheme {
  static FlutterFlowTheme _instance = FlutterFlowTheme._internal();

  factory FlutterFlowTheme() {
    return _instance;
  }

  FlutterFlowTheme._internal();

  static FlutterFlowTheme of(BuildContext context) {
    return _instance;
  }

  // Colors
  Color get primary => Color(0xFF3A7BD5);
  Color get primaryBackground => Colors.white;
  Color get secondaryBackground => Color(0xFFF5F5F5);
  Color get primaryText => Color(0xFF1A1A1A);
  Color get secondaryText => Color(0xFF8B8B8B);
  Color get alternate => Color(0xFFE0E0E0);
  Color get success => Color(0xFF4CAF50);
  Color get error => Color(0xFFF44336);
  Color get primary10 => Color(0xFFE3F2FD);

  // Typography Styles
  TextStyle get labelSmall => GoogleFonts.roboto(
        fontSize: 12,
        fontWeight: FontWeight.w500,
        color: secondaryText,
      );

  String get labelSmallFamily => 'Roboto';
  bool get labelSmallIsCustom => false;

  TextStyle get labelMedium => GoogleFonts.roboto(
        fontSize: 14,
        fontWeight: FontWeight.w500,
        color: secondaryText,
      );

  String get labelMediumFamily => 'Roboto';
  bool get labelMediumIsCustom => false;

  TextStyle get bodyMedium => GoogleFonts.roboto(
        fontSize: 14,
        fontWeight: FontWeight.w400,
        color: primaryText,
      );

  String get bodyMediumFamily => 'Roboto';
  bool get bodyMediumIsCustom => false;

  TextStyle get titleMedium => GoogleFonts.roboto(
        fontSize: 16,
        fontWeight: FontWeight.w600,
        color: primaryText,
      );

  String get titleMediumFamily => 'Roboto';
  bool get titleMediumIsCustom => false;

  TextStyle get headlineMedium => GoogleFonts.roboto(
        fontSize: 24,
        fontWeight: FontWeight.w800,
        color: primaryText,
      );

  String get headlineMediumFamily => 'Roboto';
  bool get headlineMediumIsCustom => false;

  TextStyle get headlineLarge => GoogleFonts.roboto(
        fontSize: 32,
        fontWeight: FontWeight.w800,
        color: primaryText,
      );

  String get headlineLargeFamily => 'Roboto';
  bool get headlineLargeIsCustom => false;
}
