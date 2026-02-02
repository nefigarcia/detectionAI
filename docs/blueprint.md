# **App Name**: Defect Detective

## Core Features:

- Live Camera Stream with Defect Detection: Display a live video feed from a connected camera and overlay a red rectangle around detected defects.  Communicate with the inference API.
- Image Upload for Model Training: Allow users to upload images to S3 storage to be used for training the defect detection model. Call POST /api/images/upload
- Dataset Creation and Management: Enable users to group selected images into datasets and manage these datasets. Call POST /api/datasets/create and GET /api/datasets/:id/export
- Model Training Orchestration: Orchestrate the training of the defect detection model using uploaded images.  Start, stop and monitor training.  Call POST /api/training/start, and POST /api/models/register when ready.
- Defect Metrics Analytics Dashboard: Provide a dashboard that displays metrics and analytics related to detected defects, including trends and root-cause analysis. LLM tool can recommend insights.
- Ad-hoc Image Check: Ability to upload images and receive defect predictions without training the model using POST /api/inference/predict.
- Roboflow Integration: Integrate with Roboflow for image labeling and dataset management, including API calls to import S3 bucket data. Export dataset from Roboflow to S3 in YOLOv8 format (projects/{proj}/datasets/v1/).

## Style Guidelines:

- Primary color: Deep blue (#2E5266) to convey trust and precision in the detection process.
- Background color: Light gray (#F0F4F7), offering a neutral backdrop that ensures content and detections are the focus.
- Accent color: A vibrant teal (#3E9A96) for interactive elements and highlighting detected defects.
- Font pairing: 'Space Grotesk' (sans-serif) for headlines to give a computerized feel, combined with 'Inter' (sans-serif) for body text for readability.
- Use clear and precise icons to represent different defect types and metrics, ensuring they are easily distinguishable.
- Prioritize a clean, modular layout with clear sections for camera feed, analytics, and training controls.
- Incorporate subtle animations to highlight detected defects and provide feedback during the training process.