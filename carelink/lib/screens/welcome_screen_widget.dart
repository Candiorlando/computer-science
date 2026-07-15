import '/components/button_widget.dart';
import '/components/stat_item_widget.dart';
import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/flutter_flow/flutter_flow_widgets.dart';
import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lottie/lottie.dart';
import 'package:provider/provider.dart';

import 'welcome_screen_model.dart';
export 'welcome_screen_model.dart';

class WelcomeScreenWidget extends StatefulWidget {
  const WelcomeScreenWidget({super.key});

  static String routeName = 'WelcomeScreen';
  static String routePath = '/welcomeScreen';

  @override
  State<WelcomeScreenWidget> createState() => _WelcomeScreenWidgetState();
}

class _WelcomeScreenWidgetState extends State<WelcomeScreenWidget> {
  late WelcomeScreenModel _model;

  final scaffoldKey = GlobalKey<ScaffoldState>();

  @override
  void initState() {
    super.initState();
    _model = createModel(context, () => WelcomeScreenModel());

    logFirebaseEvent('screen_view',
        parameters: {'screen_name': 'WelcomeScreen'});
    WidgetsBinding.instance.addPostFrameCallback((_) => safeSetState(() {}));
  }

  @override
  void dispose() {
    _model.dispose();

    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () {
        FocusScope.of(context).unfocus();
        FocusManager.instance.primaryFocus?.unfocus();
      },
      child: Scaffold(
        key: scaffoldKey,
        backgroundColor: FlutterFlowTheme.of(context).primaryBackground,
        body: SingleChildScrollView(
          primary: false,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            mainAxisAlignment: MainAxisAlignment.start,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Padding(
                padding: EdgeInsets.all(32),
                child: Container(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    mainAxisAlignment: MainAxisAlignment.start,
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      Column(
                        mainAxisSize: MainAxisSize.min,
                        mainAxisAlignment: MainAxisAlignment.center,
                        crossAxisAlignment: CrossAxisAlignment.center,
                        children: [
                          Text(
                            FFLocalizations.of(context).getText(
                              'y3t7hvv0' /* Current Client */,
                            ),
                            style: FlutterFlowTheme.of(context)
                                .labelMedium
                                .override(
                                  fontFamily: FlutterFlowTheme.of(context)
                                      .labelMediumFamily,
                                  color: FlutterFlowTheme.of(context)
                                      .secondaryText,
                                  letterSpacing: 0.0,
                                  lineHeight: 1.2,
                                  useGoogleFonts: !FlutterFlowTheme.of(context)
                                      .labelMediumIsCustom,
                                ),
                          ),
                          Text(
                            FFLocalizations.of(context).getText(
                              '71qbzfmx' /* Sarah Johnson */,
                            ),
                            style: FlutterFlowTheme.of(context)
                                .headlineMedium
                                .override(
                                  fontFamily: FlutterFlowTheme.of(context)
                                      .headlineMediumFamily,
                                  color:
                                      FlutterFlowTheme.of(context).primaryText,
                                  letterSpacing: 0.0,
                                  fontWeight: FontWeight.w800,
                                  lineHeight: 1.2,
                                  useGoogleFonts: !FlutterFlowTheme.of(context)
                                      .headlineMediumIsCustom,
                                ),
                          ),
                          Container(
                            decoration: BoxDecoration(
                              color: FlutterFlowTheme.of(context)
                                  .secondaryBackground,
                              borderRadius: BorderRadius.circular(16),
                              shape: BoxShape.rectangle,
                              border: Border.all(
                                color: FlutterFlowTheme.of(context).alternate,
                                width: 1,
                              ),
                            ),
                            child: Padding(
                              padding: EdgeInsetsDirectional.fromSTEB(
                                  24, 16, 24, 16),
                              child: Container(
                                child: Row(
                                  mainAxisSize: MainAxisSize.min,
                                  mainAxisAlignment: MainAxisAlignment.start,
                                  crossAxisAlignment: CrossAxisAlignment.center,
                                  children: [
                                    Icon(
                                      Icons.schedule_rounded,
                                      color:
                                          FlutterFlowTheme.of(context).primary,
                                      size: 20,
                                    ),
                                    Text(
                                      FFLocalizations.of(context).getText(
                                        'hzbgra4e' /* Shift: 08:00 AM - 04:00 PM */,
                                      ),
                                      style: FlutterFlowTheme.of(context)
                                          .bodyMedium
                                          .override(
                                            fontFamily:
                                                FlutterFlowTheme.of(context)
                                                    .bodyMediumFamily,
                                            color: FlutterFlowTheme.of(context)
                                                .primaryText,
                                            letterSpacing: 0.0,
                                            lineHeight: 1.5,
                                            useGoogleFonts:
                                                !FlutterFlowTheme.of(context)
                                                    .bodyMediumIsCustom,
                                          ),
                                    ),
                                  ].divide(SizedBox(width: 16)),
                                ),
                              ),
                            ),
                          ),
                        ].divide(SizedBox(height: 8)),
                      ),
                      Column(
                        mainAxisSize: MainAxisSize.min,
                        mainAxisAlignment: MainAxisAlignment.center,
                        crossAxisAlignment: CrossAxisAlignment.center,
                        children: [
                          Text(
                            FFLocalizations.of(context).getText(
                              'eg2oerhv' /* 10:45 AM */,
                            ),
                            style: FlutterFlowTheme.of(context)
                                .headlineLarge
                                .override(
                                  fontFamily: FlutterFlowTheme.of(context)
                                      .headlineLargeFamily,
                                  color:
                                      FlutterFlowTheme.of(context).primaryText,
                                  fontSize: 48,
                                  letterSpacing: 0.0,
                                  lineHeight: 1.2,
                                  useGoogleFonts: !FlutterFlowTheme.of(context)
                                      .headlineLargeIsCustom,
                                ),
                          ),
                          Row(
                            mainAxisSize: MainAxisSize.max,
                            mainAxisAlignment: MainAxisAlignment.center,
                            crossAxisAlignment: CrossAxisAlignment.center,
                            children: [
                              Container(
                                width: 8,
                                height: 8,
                                decoration: BoxDecoration(
                                  color: FlutterFlowTheme.of(context).success,
                                  borderRadius: BorderRadius.circular(9999),
                                  shape: BoxShape.rectangle,
                                ),
                              ),
                              Text(
                                FFLocalizations.of(context).getText(
                                  'ce6vzdkq' /* Shift Duration: 02h 45m */,
                                ),
                                style: FlutterFlowTheme.of(context)
                                    .titleMedium
                                    .override(
                                      fontFamily: FlutterFlowTheme.of(context)
                                          .titleMediumFamily,
                                      color:
                                          FlutterFlowTheme.of(context).success,
                                      letterSpacing: 0.0,
                                      lineHeight: 1.4,
                                      useGoogleFonts:
                                          !FlutterFlowTheme.of(context)
                                              .titleMediumIsCustom,
                                    ),
                              ),
                            ].divide(SizedBox(width: 8)),
                          ),
                        ].divide(SizedBox(height: 4)),
                      ),
                      Column(
                        mainAxisSize: MainAxisSize.min,
                        mainAxisAlignment: MainAxisAlignment.center,
                        crossAxisAlignment: CrossAxisAlignment.center,
                        children: [
                          Stack(
                            alignment: AlignmentDirectional(-1, -1),
                            children: [
                              Container(
                                width: 160,
                                height: 160,
                                decoration: BoxDecoration(
                                  color: FlutterFlowTheme.of(context).primary10,
                                  borderRadius: BorderRadius.circular(9999),
                                  shape: BoxShape.rectangle,
                                ),
                              ),
                              Container(
                                width: 120,
                                height: 120,
                                decoration: BoxDecoration(
                                  color: FlutterFlowTheme.of(context)
                                      .secondaryBackground,
                                  borderRadius: BorderRadius.circular(24),
                                  shape: BoxShape.rectangle,
                                  border: Border.all(
                                    color:
                                        FlutterFlowTheme.of(context).alternate,
                                    width: 2,
                                  ),
                                ),
                                alignment: AlignmentDirectional(0, 0),
                                child: Stack(
                                  alignment: AlignmentDirectional(0, 0),
                                  children: [
                                    Lottie.network(
                                      'https://dimg.dreamflow.cloud/v1/lottie/biometric+scanning+authentication+circle',
                                      width: 100,
                                      height: 100,
                                      fit: BoxFit.contain,
                                      animate: true,
                                    ),
                                    Icon(
                                      Icons.fingerprint_rounded,
                                      color:
                                          FlutterFlowTheme.of(context).primary,
                                      size: 48,
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                          Container(
                            decoration: BoxDecoration(
                              color: FlutterFlowTheme.of(context)
                                  .secondaryBackground,
                              borderRadius: BorderRadius.circular(12),
                              shape: BoxShape.rectangle,
                              border: Border.all(
                                color: FlutterFlowTheme.of(context).alternate,
                                width: 1,
                              ),
                            ),
                            child: Padding(
                              padding: EdgeInsets.all(16),
                              child: Container(
                                child: Column(
                                  mainAxisSize: MainAxisSize.min,
                                  mainAxisAlignment: MainAxisAlignment.start,
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Row(
                                      mainAxisSize: MainAxisSize.max,
                                      mainAxisAlignment:
                                          MainAxisAlignment.start,
                                      crossAxisAlignment:
                                          CrossAxisAlignment.center,
                                      children: [
                                        Icon(
                                          Icons.location_on_rounded,
                                          color: FlutterFlowTheme.of(context)
                                              .success,
                                          size: 16,
                                        ),
                                        Text(
                                          FFLocalizations.of(context).getText(
                                            'jj9l2vld' /* GPS Geolocation Active */,
                                          ),
                                          style: FlutterFlowTheme.of(context)
                                              .labelSmall
                                              .override(
                                                fontFamily:
                                                    FlutterFlowTheme.of(context)
                                                        .labelSmallFamily,
                                                color:
                                                    FlutterFlowTheme.of(context)
                                                        .secondaryText,
                                                letterSpacing: 0.0,
                                                lineHeight: 1.2,
                                                useGoogleFonts:
                                                    !FlutterFlowTheme.of(
                                                            context)
                                                        .labelSmallIsCustom,
                                              ),
                                        ),
                                      ].divide(SizedBox(width: 8)),
                                    ),
                                    Row(
                                      mainAxisSize: MainAxisSize.max,
                                      mainAxisAlignment:
                                          MainAxisAlignment.start,
                                      crossAxisAlignment:
                                          CrossAxisAlignment.center,
                                      children: [
                                        Icon(
                                          Icons.update_rounded,
                                          color: FlutterFlowTheme.of(context)
                                              .success,
                                          size: 16,
                                        ),
                                        Text(
                                          FFLocalizations.of(context).getText(
                                            'jbmu9u7a' /* Timestamp & Biometric Ready */,
                                          ),
                                          style: FlutterFlowTheme.of(context)
                                              .labelSmall
                                              .override(
                                                fontFamily:
                                                    FlutterFlowTheme.of(context)
                                                        .labelSmallFamily,
                                                color:
                                                    FlutterFlowTheme.of(context)
                                                        .secondaryText,
                                                letterSpacing: 0.0,
                                                lineHeight: 1.2,
                                                useGoogleFonts:
                                                    !FlutterFlowTheme.of(
                                                            context)
                                                        .labelSmallIsCustom,
                                              ),
                                        ),
                                      ].divide(SizedBox(width: 8)),
                                    ),
                                  ].divide(SizedBox(height: 8)),
                                ),
                              ),
                            ),
                          ),
                          Container(
                            child: Column(
                              mainAxisSize: MainAxisSize.min,
                              mainAxisAlignment: MainAxisAlignment.start,
                              crossAxisAlignment: CrossAxisAlignment.stretch,
                              children: [
                                Container(
                                  height: 64,
                                  child: wrapWithModel(
                                    model: _model.buttonModel1,
                                    updateCallback: () => safeSetState(() {}),
                                    child: ButtonWidget(
                                      content: 'Verify & Clock In',
                                      icon: 'login_rounded',
                                      icon_present: true,
                                      icon_end: 'arrow_forward_rounded',
                                      icon_end_present: false,
                                      color: FlutterFlowTheme.of(context).error,
                                      bg: FlutterFlowTheme.of(context).success,
                                      height: 64.0,
                                      radius: 24.0,
                                      variant: 'primary',
                                      size: 'medium',
                                      full_width: false,
                                      loading: false,
                                      disabled: false,
                                    ),
                                  ),
                                ),
                                Container(
                                  height: 64,
                                  child: wrapWithModel(
                                    model: _model.buttonModel2,
                                    updateCallback: () => safeSetState(() {}),
                                    child: ButtonWidget(
                                      content: 'Verify & Clock Out',
                                      icon: 'logout_rounded',
                                      icon_present: true,
                                      icon_end: 'arrow_forward_rounded',
                                      icon_end_present: false,
                                      color: FlutterFlowTheme.of(context).error,
                                      bg: FlutterFlowTheme.of(context).error,
                                      height: 64.0,
                                      radius: 24.0,
                                      variant: 'primary',
                                      size: 'medium',
                                      full_width: false,
                                      loading: false,
                                      disabled: false,
                                    ),
                                  ),
                                ),
                              ].divide(SizedBox(height: 16)),
                            ),
                          ),
                        ].divide(SizedBox(height: 24)),
                      ),
                      Container(
                        decoration: BoxDecoration(
                          color:
                              FlutterFlowTheme.of(context).secondaryBackground,
                          borderRadius: BorderRadius.circular(16),
                          shape: BoxShape.rectangle,
                          border: Border.all(
                            color: FlutterFlowTheme.of(context).alternate,
                            width: 1,
                          ),
                        ),
                        child: Padding(
                          padding: EdgeInsets.all(24),
                          child: Container(
                            child: Row(
                              mainAxisSize: MainAxisSize.max,
                              mainAxisAlignment: MainAxisAlignment.spaceAround,
                              crossAxisAlignment: CrossAxisAlignment.center,
                              children: [
                                Expanded(
                                  flex: 1,
                                  child: wrapWithModel(
                                    model: _model.statItemModel1,
                                    updateCallback: () => safeSetState(() {}),
                                    child: StatItemWidget(
                                      label: 'Tasks Done',
                                      value: '4/12',
                                    ),
                                  ),
                                ),
                                Container(
                                  width: 1,
                                  height: 24,
                                  decoration: BoxDecoration(
                                    color:
                                        FlutterFlowTheme.of(context).alternate,
                                  ),
                                ),
                                Expanded(
                                  flex: 1,
                                  child: wrapWithModel(
                                    model: _model.statItemModel2,
                                    updateCallback: () => safeSetState(() {}),
                                    child: StatItemWidget(
                                      label: 'Next Meds',
                                      value: '11:30 AM',
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ),
                      Column(
                        mainAxisSize: MainAxisSize.min,
                        mainAxisAlignment: MainAxisAlignment.center,
                        crossAxisAlignment: CrossAxisAlignment.center,
                        children: [
                          Text(
                            FFLocalizations.of(context).getText(
                              'cjqr0lgd' /* Having issues with the scanner... */,
                            ),
                            style: FlutterFlowTheme.of(context)
                                .labelSmall
                                .override(
                                  fontFamily: FlutterFlowTheme.of(context)
                                      .labelSmallFamily,
                                  color: FlutterFlowTheme.of(context)
                                      .secondaryText,
                                  letterSpacing: 0.0,
                                  lineHeight: 1.2,
                                  useGoogleFonts: !FlutterFlowTheme.of(context)
                                      .labelSmallIsCustom,
                                ),
                          ),
                          Row(
                            mainAxisSize: MainAxisSize.max,
                            mainAxisAlignment: MainAxisAlignment.center,
                            crossAxisAlignment: CrossAxisAlignment.center,
                            children: [
                              Text(
                                FFLocalizations.of(context).getText(
                                  'tw9c9y4j' /* Contact Supervisor */,
                                ),
                                style: FlutterFlowTheme.of(context)
                                    .labelSmall
                                    .override(
                                      fontFamily: FlutterFlowTheme.of(context)
                                          .labelSmallFamily,
                                      color:
                                          FlutterFlowTheme.of(context).primary,
                                      letterSpacing: 0.0,
                                      decoration: TextDecoration.underline,
                                      lineHeight: 1.2,
                                      useGoogleFonts:
                                          !FlutterFlowTheme.of(context)
                                              .labelSmallIsCustom,
                                    ),
                              ),
                              Text(
                                FFLocalizations.of(context).getText(
                                  'jk0v89nu' /* or */,
                                ),
                                style: FlutterFlowTheme.of(context)
                                    .labelSmall
                                    .override(
                                      fontFamily: FlutterFlowTheme.of(context)
                                          .labelSmallFamily,
                                      color: FlutterFlowTheme.of(context)
                                          .secondaryText,
                                      letterSpacing: 0.0,
                                      lineHeight: 1.2,
                                      useGoogleFonts:
                                          !FlutterFlowTheme.of(context)
                                              .labelSmallIsCustom,
                                    ),
                              ),
                              Text(
                                FFLocalizations.of(context).getText(
                                  'a6ya32tm' /* Manual Entry */,
                                ),
                                style: FlutterFlowTheme.of(context)
                                    .labelSmall
                                    .override(
                                      fontFamily: FlutterFlowTheme.of(context)
                                          .labelSmallFamily,
                                      color:
                                          FlutterFlowTheme.of(context).primary,
                                      letterSpacing: 0.0,
                                      decoration: TextDecoration.underline,
                                      lineHeight: 1.2,
                                      useGoogleFonts:
                                          !FlutterFlowTheme.of(context)
                                              .labelSmallIsCustom,
                                    ),
                              ),
                            ].divide(SizedBox(width: 4)),
                          ),
                        ].divide(SizedBox(height: 4)),
                      ),
                      Container(
                        height: 24,
                      ),
                    ].divide(SizedBox(height: 32)),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
