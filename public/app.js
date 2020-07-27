// Copyright (c) 2019 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/* ===
Adapted from:
ml5 Example
PoseNet example using p5.js
Available at https://ml5js.org
=== */

let video;
let poseNet;
let poses = [];
let side = 'left';

let maxKneeFlexion = 180;
let maxHipFlexion = 180;
let maxDorsiflexion = 180;
let maxTrunkLean = 180;

let knee, hip, ankle, kneeFlexion, dorsiflexion, hipFlexion, shoulder, anKnee, sHip, trunkLean;

function setup() {
	let canvas = createCanvas(640, 480);
	canvas.parent('app');
	video = createCapture(
	{
  video: {
		width: 640,
		height: 480,
    facingMode: {
      exact: 'environment'
    }
  }
}
	);
	video.size(width, height);

	// Create a new poseNet method with a single detection
	poseNet = ml5.poseNet(video, modelReady);

	// This sets up an event that fills the global variable "poses"
	// with an array every time new poses are detected
	// and extracts only the keypoints we are interested in (knee, hip, ankle, shoulder)
	// before also calculating the angles between these keypoints with atan2
	poseNet.on('pose', function(results) {
		poses = results;

		if (poses.length > 0) {
			switch (side) {
				case 'left':
					knee = poses[0].pose.leftKnee;
					hip = poses[0].pose.leftHip;
					ankle = poses[0].pose.leftAnkle;
					shoulder = poses[0].pose.leftShoulder;
					anKnee = { x: knee.x, y: ankle.y };
					sHip = { x: shoulder.x, y: hip.y };
					kneeFlexion =
						(Math.atan2(ankle.y - knee.y, ankle.x - knee.x) - Math.atan2(hip.y - knee.y, hip.x - knee.x)) *
						(180 / Math.PI);
					hipFlexion =
						360 -
						(Math.atan2(knee.y - hip.y, knee.x - hip.x) -
							Math.atan2(shoulder.y - hip.y, shoulder.x - hip.x)) *
							(180 / Math.PI);
					dorsiflexion =
						360 -
						(Math.atan2(anKnee.y - ankle.y, anKnee.x - ankle.x) -
							Math.atan2(knee.y - ankle.y, knee.x - ankle.x)) *
							(180 / Math.PI);
					trunkLean =
						360 -
						(Math.atan2(sHip.y - hip.y, sHip.x - hip.x) -
							Math.atan2(shoulder.y - hip.y, shoulder.x - hip.x)) *
							(180 / Math.PI);
					break;
				case 'right':
					knee = poses[0].pose.rightKnee;
					hip = poses[0].pose.rightHip;
					ankle = poses[0].pose.rightAnkle;
					shoulder = poses[0].pose.rightShoulder;
					anKnee = { x: knee.x, y: ankle.y };
					sHip = { x: shoulder.x, y: hip.y };
					kneeFlexion =
						360 -
						(Math.atan2(ankle.y - knee.y, ankle.x - knee.x) - Math.atan2(hip.y - knee.y, hip.x - knee.x)) *
							(180 / Math.PI);
					hipFlexion =
						(Math.atan2(knee.y - hip.y, knee.x - hip.x) -
							Math.atan2(shoulder.y - hip.y, shoulder.x - hip.x)) *
						(180 / Math.PI);
					dorsiflexion =
						(Math.atan2(anKnee.y - ankle.y, anKnee.x - ankle.x) -
							Math.atan2(knee.y - ankle.y, knee.x - ankle.x)) *
						(180 / Math.PI);
					trunkLean =
						(Math.atan2(sHip.y - hip.y, sHip.x - hip.x) -
							Math.atan2(shoulder.y - hip.y, shoulder.x - hip.x)) *
						(180 / Math.PI);
			}
		}
	});

	// Hide the video element, and just show the canvas
	video.hide();

	textFont('Open Sans');
	textSize(22);

	button = createButton('<i class="fas fa-sync-alt"></i> Switch Sides');
	button.parent('switchButtonContainer');
	button.id('switchButton');
	button.class(
		'rounded-full bg-white py-3 px-4 mx-3 shadow-lg hover:text-gray-900 border-2 border-white hover:border-gray-500'
	);
	button.mousePressed(switchSides);

	button = createButton('<i class="fas fa-camera"></i> Take Snapshot');
	button.parent('saveButtonContainer');
	button.id('saveButton');
	button.class(
		'rounded-full bg-white py-3 px-4 mx-3 shadow-lg hover:text-gray-900 border-2 border-white hover:border-gray-500'
	);
	button.mousePressed(saveImage);
}

function switchSides() {
	switch (side) {
		case 'left':
			side = 'right';
			select('#sideInstruction').html('right');
			resetMax();
			break;
		case 'right':
			side = 'left';
			select('#sideInstruction').html('left');
			resetMax();
	}
}

function resetMax() {
	maxKneeFlexion = 180;
	maxHipFlexion = 180;
	maxDorsiflexion = 180;
	maxTrunkLean = 180;

	select('#kneeFlexion').html('-');
	select('#hipFlexion').html('-');
	select('#shinAngle').html('-');
	select('#trunkAngle').html('-');
}

function saveImage() {
	saveCanvas(canvas, 'snapshot', 'png');
}

function modelReady() {
	select('#status').style('color', '#4A5568');
	select('#status').html('Ready! <i class="fas fa-check-circle" style="color:#4A5568;"></i>');
}

function draw() {
	image(video, 0, 0, width, height);

	// We can call both functions to draw all keypoints and the skeletons
	drawKeypoints();
	drawSkeleton();

	if (poses.length > 0) {
		// draws the angles as they happen over the video feed
		fill('#FFFFFF');
		text(Math.round(kneeFlexion) + '°', knee.x + 20, knee.y + 10);
		text(Math.round(hipFlexion) + '°', hip.x + 20, hip.y + 10);
		text(Math.round(dorsiflexion) + '°', ankle.x + 20, ankle.y + 10);
		text(Math.round(trunkLean) + '°', shoulder.x + 20, shoulder.y + 10);

		// updates the max numbers reached if they are exceeded at any time
		// then replaces the connected HTML span with the new max number
		if ((knee.confidence > 0.5) & (kneeFlexion > 20) & (kneeFlexion < maxKneeFlexion)) {
			maxKneeFlexion = Math.round(kneeFlexion);
			select('#kneeFlexion').html(maxKneeFlexion);
		}
		if ((hip.confidence > 0.5) & (hipFlexion > 20) & (hipFlexion < maxHipFlexion)) {
			maxHipFlexion = Math.round(hipFlexion);
			select('#hipFlexion').html(maxHipFlexion);
		}
		if ((ankle.confidence > 0.5) & (dorsiflexion > 20) & (dorsiflexion < maxDorsiflexion)) {
			maxDorsiflexion = Math.round(dorsiflexion);
			select('#shinAngle').html(maxDorsiflexion);
		}
		if ((shoulder.confidence > 0.5) & (trunkLean > 20) & (trunkLean < maxTrunkLean)) {
			maxTrunkLean = Math.round(trunkLean);
			select('#trunkAngle').html(maxTrunkLean);
		}
	}
}

// A function to draw ellipses over the detected keypoints
function drawKeypoints() {
	// Loop through all the poses detected
	for (let i = 0; i < poses.length; i++) {
		// For each pose detected, loop through all the keypoints
		let pose = poses[i].pose;
		for (let j = 0; j < pose.keypoints.length; j++) {
			// A keypoint is an object describing a body part (like rightArm or leftShoulder)
			let keypoint = pose.keypoints[j];
			// Only draw an ellipse is the pose probability is bigger than 0.2
			if (keypoint.score > 0.5) {
				push();
				fill('rgba(255,255,255, 0.5)');
				noStroke();
				ellipse(keypoint.position.x, keypoint.position.y, 10, 10);
				pop();
			}
		}
	}
}

// A function to draw the skeletons
function drawSkeleton() {
	// Loop through all the skeletons detected
	for (let i = 0; i < poses.length; i++) {
		let skeleton = poses[i].skeleton;
		// For every skeleton, loop through all body connections
		for (let j = 0; j < skeleton.length; j++) {
			let partA = skeleton[j][0];
			let partB = skeleton[j][1];
			stroke('rgba(255,255,255, 0.5)');
			line(partA.position.x, partA.position.y, partB.position.x, partB.position.y);
		}
	}
}
